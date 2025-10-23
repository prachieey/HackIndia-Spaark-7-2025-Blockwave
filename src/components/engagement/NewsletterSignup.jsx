import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, X, Loader2, Shield, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setStatus('loading');
    
    try {
      console.log('Sending subscription request to backend...');
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned a non-JSON response');
      }
      
      console.log('Backend Response:', { status: response.status, statusText: response.statusText, result });
      
      if (response.ok) {
        console.log('Subscription successful!');
        setStatus('success');
        setShowSuccess(true);
        setEmail('');
        
        // Show success toast
        toast.success(result.message || 'Successfully subscribed to our newsletter!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true
        });
      } else {
        const errorMessage = result.message || 
                           result.error || 
                           `Failed to subscribe. Status: ${response.status} ${response.statusText}`;
        console.error('Subscription failed:', errorMessage, result);
        setStatus('error');
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true
        });
      }
    } catch (error) {
      console.error('Error during subscription:', error);
      setStatus('error');
      toast.error(`Error: ${error.message}`);
    }
  };

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <section className="py-16 bg-gradient-to-b from-space-black to-deep-purple/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="relative bg-gradient-to-r from-deep-purple/20 to-tech-blue/20 backdrop-blur-sm rounded-2xl p-8 md:p-12 overflow-hidden border border-white/5 shadow-2xl">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-tech-blue/5 to-transparent rounded-full filter blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-deep-purple/5 rounded-full filter blur-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tech-blue/5 via-transparent to-transparent opacity-50"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-holographic-white mb-4">Stay in the Loop</h3>
              <p className="text-lg text-holographic-white/80 max-w-2xl mx-auto">
                Subscribe to our newsletter for the latest event updates, exclusive offers, and security tips.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-5 py-3.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-holographic-white placeholder-holographic-white/40 focus:outline-none focus:ring-2 focus:ring-tech-blue/50 focus:border-transparent transition-all"
                    required
                    disabled={status === 'loading'}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-tech-blue to-deep-purple hover:from-tech-blue/90 hover:to-deep-purple/90 text-white px-6 py-3.5 rounded-xl font-medium whitespace-nowrap transition-all hover:shadow-lg hover:shadow-tech-blue/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="-ml-1" />
                      Subscribe
                    </>
                  )}
                </motion.button>
              </div>
              <p className="mt-3 text-sm text-holographic-white/50 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center text-holographic-white/70 text-sm">
                <Shield className="w-4 h-4 mr-2 text-tech-blue" />
                No spam, ever
              </div>
              <div className="flex items-center text-holographic-white/70 text-sm">
                <Lock className="w-4 h-4 mr-2 text-deep-purple" />
                Your data is secure
              </div>
            </div>
          </div>
        </div>

        {/* Success Popup */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 border border-green-400/30">
                <Check className="h-5 w-5 text-white" />
                <span>Successfully subscribed to our newsletter!</span>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default NewsletterSignup;
