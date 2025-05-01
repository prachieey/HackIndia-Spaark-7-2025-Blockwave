import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccess(true);
    setLoading(false);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
    
    // Reset success message after delay
    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-holographic-white mb-4">Contact Us</h1>
          <p className="tagline">No Scams, Just Scans</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-holographic-white mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <p className="text-holographic-white/80">
                Have questions about Scantyx or need help with your event? Our team is here to assist you.
                Fill out the form and we'll get back to you as soon as possible.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-tech-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-holographic-white">Email Us</h3>
                    <p className="text-holographic-white/70">support@scantyx.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-tech-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-holographic-white">Call Us</h3>
                    <p className="text-holographic-white/70">+91 1234 567890</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-tech-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-holographic-white">Visit Us</h3>
                    <p className="text-holographic-white/70">
                      Scantyx HQ, Tech Park<br />
                      Bengaluru, Karnataka 560001<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-holographic-white mb-6">Send a Message</h2>
              
              {success ? (
                <div className="bg-validation-green bg-opacity-20 border border-validation-green rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-validation-green bg-opacity-20 rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-validation-green" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-holographic-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-holographic-white/70">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-holographic-white mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input w-full"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-holographic-white mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input w-full"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-holographic-white mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="input w-full"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary w-full flex items-center justify-center ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-holographic-white mr-2"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;