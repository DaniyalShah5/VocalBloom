import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Support = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();

    const serviceId = import.meta.env.VITE_SERVICE_ID;
    const templateId = import.meta.env.VITE_SUPPORT_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_PUBLIC_KEY;

    emailjs.send(serviceId, templateId, contactForm, publicKey)
      .then((response) => {
        alert(`Thank you ${contactForm.name}! Your message has been sent.`);
        setContactForm({ name: '', email: '', message: '' });
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        alert('Oops! Something went wrong. Please try again later.');
      });
  };

  const contactInfo = [
    { icon: <Phone size={20} />, title: "Phone", content: "+921234567890", details: "Monday-Friday, 9AM-5PM" },
    { icon: <Mail size={20} />, title: "Email", content: "support@VocalBloom.com", details: "We respond within 24 hours" },
    { icon: <MapPin size={20} />, title: "Office", content: "123 Therapy Road, Town 200", details: "Hazara Town, 02110" },
    { icon: <Clock size={20} />, title: "Hours", content: "Monday-Friday: 9AM-5PM", details: "Saturday: 10AM-2PM" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50">
      {/* Hero Section */}
      <div className=" text-gray-800 py-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Support Center</h1>
          <p className="text-lg text-gray-600">We're here to help with any questions about our speech therapy website</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-6xl mx-auto px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-110 transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center h-10 w-10 bg-blue-100 text-blue-600 rounded-full mr-3">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              <p className="text-gray-800 font-medium">{item.content}</p>
              <p className="text-gray-500 text-sm mt-1">{item.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-2xl duration-700 ">
            <h2 className="text-2xl font-bold mb-6 text-center">Contact Our Support Team</h2>
            <p className="text-gray-600 mb-6 text-center">Have a question or need assistance? Send us a message and we'll get back to you promptly.</p>

            <form onSubmit={handleContactSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-[#8ec1db] hover:bg-[#94d0ed] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
                >
                  Send Message
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
