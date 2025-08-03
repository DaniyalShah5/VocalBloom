import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TherapyModules = () => {
  const [categories, setCategories] = useState([
    "Articulation Disorders",
    "Language Delays",
    "Stuttering",
    "Voice Disorders",
    "Apraxia of Speech",
    "Aphasia",
    "Autism Spectrum Disorders",
    "Swallowing Disorders",
    "Hearing Impairments",
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modules, setModules] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchModulesAndTherapists = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");

        const modulesRes = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/therapy/category/${selectedCategory}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const therapistsRes = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/therapists/specialty/${selectedCategory}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setModules(modulesRes.data);
        setTherapists(therapistsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("You need to register to view modules.");
      } finally {
        setLoading(false);
      }
    };

    fetchModulesAndTherapists();
  }, [selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const categoryDescriptions = {
    "Articulation Disorders": "Difficulty producing certain speech sounds correctly.",
  "Language Delays": "Delayed development of understanding or using spoken language.",
  "Stuttering": "Interruptions in the flow of speech, such as repetitions or blocks.",
  "Voice Disorders": "Issues with pitch, volume, or quality of the voice.",
  "Apraxia of Speech": "Motor planning problem that affects speech clarity and consistency.",
  "Aphasia": "Loss or impairment of language due to brain injury or stroke.",
  "Autism Spectrum Disorders": "Challenges in communication, social interaction, and language development.",
  "Swallowing Disorders": "Difficulty with chewing or swallowing food and liquids safely (dysphagia).",
  "Hearing Impairments": "Partial or total hearing loss affecting speech perception and language skills."
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="mb-3 text-center  text-4xl font-bold text-gray-800">
          Speech Therapy Modules
        </h1>

        {!selectedCategory ? (
          <div>
            <h2 className="text-lg text-gray-600 text-center mb-10">
              Start by selecting a speech therapy category that fits your needs:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="group relative bg-gradient-to-br from-white to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-blue-100 hover:border-blue-200 flex flex-col gap-5 overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  
                  

                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-center text-gray-800 mb-2 group-hover:text-[] transition-colors duration-300">
                      {category}
                    </h3>

                    <p className="text-gray-600 text-sm text-center leading-relaxed mb-4">
                      {categoryDescriptions[category]}
                    </p>

                    <div className="flex items-center justify-center gap-2 text-blue-400 text-xs font-medium">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      <span>Explore resources & specialists</span>
                    </div>
                  </div>

                  
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200/2 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="relative flex flex-col sm:flex-row items-center mb-10 mt-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-black hover:opacity-70 sm:mr-4 sm:self-start z-10"
              >
                ← Back to Categories
              </button>

              <h2 className="text-3xl text-gray-600 font-semibold sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:w-full sm:text-center mt-2 sm:mt-0">
                {selectedCategory}
              </h2>
            </div>

            {loading ? (
              <div className="sm:min-h-screen sm:flex sm:items-center sm:justify-center ">
                <div className="flex flex-col items-center justify-center min-h-64 p-8">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
                      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mt-6 font-medium">
                    Loading Module data...
                  </p>
                  <div className="flex space-x-1 mt-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-100 flex justify-center text-lg text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Therapy Modules */}
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    Available Therapy Modules
                  </h3>
                  {modules.length === 0 ? (
                    <p className="text-gray-600">
                      No modules available for this category yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {modules.map((module) => (
                        <div
                          key={module._id}
                          className="bg-white p-5 rounded-lg shadow-md"
                        >
                          <h4 className="text-lg font-medium text-[#5495b5]">
                            {module.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 mt-2 mb-3">
                            <span className="mr-4">
                              Difficulty: {module.difficultyLevel}
                            </span>
                            <span>
                              Duration: {module.estimatedTimeMinutes} minutes
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {module.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {module.exercises.map((exercise, i) => (
                              <span
                                key={i}
                                className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                              >
                                {exercise}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <Link
                              to={`/module/${module._id}`}
                              className="bg-[#6ec4ef] text-white px-4 py-2 rounded hover:bg-[#6ec4efcf] focus:outline-none transition-colors"
                            >
                              View Module
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Recommended Therapists */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Recommended Therapists
                  </h3>
                  {therapists.length === 0 ? (
                    <p className="text-gray-600">
                      No specialists available for this category yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {therapists.map((therapist) => (
                        <div
                          key={therapist._id}
                          className="bg-white p-4 rounded-lg shadow-md"
                        >
                          <h4 className="font-medium">
                            {therapist.profile.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Experience:{" "}
                            {therapist.qualifications.yearsOfExperience} years
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Degree: {therapist.qualifications.degree}
                          </p>
                          <div className="mt-3">
                            <strong className="text-xs text-gray-500">
                              Specialties:
                            </strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {therapist.specialties.map((specialty, i) => (
                                <span
                                  key={i}
                                  className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapyModules;
