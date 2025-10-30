import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

// Sign access token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // 15 minutes
  });
};

// Sign refresh token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 days
  });
};

// Common cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : 'localhost',
  partitioned: process.env.NODE_ENV === 'production',
});

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  
  // Set access token cookie
  res.cookie('jwt', token, {
    ...getCookieOptions(),
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });
  
  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    ...getCookieOptions(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // Remove password from output
  user.password = undefined;
  
  // Send response with both tokens
  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: { user },
  });
};

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    walletAddress: req.body.walletAddress,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || 'user',
  });

  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  let decoded;
  let currentUser;

  try {
    // 2) Verify token
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check if user still exists
    currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }
  } catch (error) {
    // If token is expired, try to refresh it
    if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
      try {
        // Get the refresh token from cookies
        const refreshToken = req.cookies.refreshToken;
        
        // Verify the refresh token
        const refreshDecoded = await promisify(jwt.verify)(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        
        // Get the user from the refresh token
        currentUser = await User.findById(refreshDecoded.id);
        if (!currentUser) {
          return next(
            new AppError('The user belonging to this token no longer exists.', 401)
          );
        }
        
        // Generate new tokens
        const newToken = signToken(currentUser._id);
        const newRefreshToken = signRefreshToken(currentUser._id);
        
        // Set new cookies
        res.cookie('jwt', newToken, {
          ...getCookieOptions(),
          expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        });
        
        res.cookie('refreshToken', newRefreshToken, {
          ...getCookieOptions(),
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        
        // Update the decoded token for further processing
        decoded = { id: currentUser._id };
        
        // Set the new token in the request for the next middleware
        req.token = newToken;
        
      } catch (refreshError) {
        // If refresh token is invalid, clear cookies and ask user to login again
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return next(
          new AppError('Your session has expired. Please log in again.', 401)
        );
      }
    } else {
      // For other JWT errors, just forward the error
      return next(
        new AppError('Invalid token. Please log in again!', 401)
      );
    }
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      let decoded;
      let currentUser;
      
      try {
        decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
        
        // 2) Check if user still exists
        currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          res.clearCookie('jwt');
          res.clearCookie('refreshToken');
          return next();
        }
      } catch (error) {
        // If token is expired, try to refresh it
        if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
          try {
            // Verify the refresh token
            const refreshDecoded = await promisify(jwt.verify)(
              req.cookies.refreshToken,
              process.env.JWT_REFRESH_SECRET
            );
            
            // Get the user from the refresh token
            currentUser = await User.findById(refreshDecoded.id);
            if (!currentUser) {
              res.clearCookie('jwt');
              res.clearCookie('refreshToken');
              return next();
            }
            
            // Generate new tokens
            const newToken = signToken(currentUser._id);
            const newRefreshToken = signRefreshToken(currentUser._id);
            
            // Set new cookies
            res.cookie('jwt', newToken, {
              ...getCookieOptions(),
              expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            });
            
            res.cookie('refreshToken', newRefreshToken, {
              ...getCookieOptions(),
              expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            });
            
            // Update the decoded token
            decoded = { id: currentUser._id };
            
          } catch (refreshError) {
            // If refresh token is invalid, clear cookies
            res.clearCookie('jwt');
            res.clearCookie('refreshToken');
            return next();
          }
        } else {
          // For other JWT errors, clear cookies and continue
          res.clearCookie('jwt');
          res.clearCookie('refreshToken');
          return next();
        }
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Verify JWT token
const verifyToken = catchAsync(async (req, res, next) => {
  // 1) Get the token from the request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(200).json({
      valid: false,
      message: 'No token provided'
    });
  }

  try {
    // 2) Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(200).json({
        valid: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(200).json({
        valid: false,
        message: 'User recently changed password! Please log in again.'
      });
    }

    // 5) If everything is ok, return the user data
    // Remove sensitive data from the output
    currentUser.password = undefined;
    currentUser.active = undefined;
    currentUser.__v = undefined;

    res.status(200).json({
      valid: true,
      user: currentUser
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(200).json({
        valid: false,
        message: 'Invalid or expired token. Please log in again.'
      });
    }
    
    // For other errors, pass to the error handling middleware
    next(error);
  }
});

const logout = (req, res) => {
  // Clear the JWT cookie with secure settings
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'none',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
  });

  // Clear any other auth-related cookies
  res.clearCookie('connect.sid', {
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
  });

  res.status(200).json({ 
    status: 'success',
    message: 'Successfully logged out' 
  });
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

// 4) Log user in, send JWT
createSendToken(user, 200, res);
});

// Get current user's profile
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Get user by ID
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-__v -passwordChangedAt');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Refresh access token
const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // Generate new tokens
    const newToken = signToken(currentUser._id);
    const newRefreshToken = signRefreshToken(currentUser._id);

    // Set new cookies
    res.cookie('jwt', newToken, {
      ...getCookieOptions(),
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
    
    res.cookie('refreshToken', newRefreshToken, {
      ...getCookieOptions(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Send response
    res.status(200).json({
      status: 'success',
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired refresh token', 401));
    }
    return next(err);
  }
});

export {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyToken,
  isLoggedIn,
  getMe,
  getUser,
  refreshAccessToken,
};
