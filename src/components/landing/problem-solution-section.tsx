'use client';

import { FadeIn } from '../fade-in';
import { AlertTriangle, CheckCircle, Users, MapPin, Clock } from 'lucide-react';

export function ProblemSolutionSection() {
  const problems = [
    {
      icon: <Users className="w-8 h-8 text-red-500" />,
      title: "Limited Access to Doctors",
      description: "Rural areas have fewer healthcare professionals, making it difficult to get timely medical advice."
    },
    {
      icon: <MapPin className="w-8 h-8 text-red-500" />,
      title: "Lack of Medicines Nearby",
      description: "Pharmacies are often far away, making it hard to get essential medications quickly."
    },
    {
      icon: <Clock className="w-8 h-8 text-red-500" />,
      title: "Emergency Response Delays",
      description: "Emergency services take longer to reach remote areas, putting lives at risk."
    }
  ];

  const solutions = [
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "24/7 AI Doctor Access",
      description: "Get instant medical consultations through our AI-powered system, available anytime, anywhere."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "Medicine Delivery Network",
      description: "Order medicines online and get them delivered to your doorstep through our pharmacy network."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "Emergency SOS System",
      description: "Alert emergency services instantly with our one-tap SOS feature for faster response times."
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-[hsl(224,71%,10%)] text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            The Challenge in <span className="text-primary font-cursive">Rural Healthcare</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Rural communities face unique healthcare challenges that urban areas don't experience.
          </p>
        </div>

        {/* Problems Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-12 flex items-center justify-center gap-3 text-white">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Current Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <FadeIn key={index} delay={200 * (index + 1)} direction="up">
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    {problem.icon}
                    <h4 className="text-xl font-bold text-gray-800">{problem.title}</h4>
                  </div>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Arrow pointing down */}
        <div className="flex justify-center mb-16">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-2xl animate-bounce">
            ↓
          </div>
        </div>

        {/* Solutions Section */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-12 flex items-center justify-center gap-3 text-white">
            <CheckCircle className="w-8 h-8 text-green-500" />
            How MediLink Solves This
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <FadeIn key={index} delay={200 * (index + 1)} direction="up">
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    {solution.icon}
                    <h4 className="text-xl font-bold text-gray-800">{solution.title}</h4>
                  </div>
                  <p className="text-gray-600">{solution.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}