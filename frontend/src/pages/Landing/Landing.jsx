import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { ShieldCheck, Wallet, Users, Fingerprint, Handshake, FileCheck } from "lucide-react";

// Clean, reusable button component
const ActionButton = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50"
  };
  
  return (
    <button 
      className={`px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Data arrays (features, workflowSteps, impactStats) remain unchanged
const features = [
  { icon: Wallet, title: "Transparent Donations", desc: "Track every rupee you donate from collection to distribution." },
  { icon: ShieldCheck, title: "Blockchain Secured", desc: "Immutable transaction logs ensure no tampering or fraud." },
  { icon: Users, title: "Verified Beneficiaries", desc: "Biometric + ID checks prevent duplicate aid claims." }
]

const workflowSteps = [
  { icon: Handshake, title: "Donate / Start NGO", desc: "Choose an NGO or launch your own cause with a clear fundraising target." },
  { icon: FileCheck, title: "Fund Utilization", desc: "Field agents purchase aid, upload receipts, and verify spending." },
  { icon: Fingerprint, title: "Aid Distribution", desc: "Beneficiaries verified via ID & biometrics to ensure fair distribution." }
]

const impactStats = [
  { value: "12k+", label: "Donors" },
  { value: "500+", label: "NGOs" },
  { value: "₹2Cr+", label: "Funds Raised" },
  { value: "50k+", label: "Beneficiaries" }
]

// Header Component
const Header = ({ onRoleSelect }) => (
  <header className="w-full bg-white shadow-md fixed top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-indigo-700">AidVerify</h1>
      <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
        <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
        <a href="#workflow" className="hover:text-indigo-600 transition-colors">Workflow</a>
        <a href="#impact" className="hover:text-indigo-600 transition-colors">Impact</a>
      </nav>
      <ActionButton onClick={() => onRoleSelect('donor')}>Get Started</ActionButton>
    </div>
  </header>
)

// Hero Section Component (WITHOUT the useEffect)
const HeroSection = ({ isSignedIn, onRoleSelect }) => {
  // The redirection useEffect has been removed from here
  // and moved to the parent Landing component.
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-gradient-to-br from-indigo-600 to-purple-700 text-white mt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          AidVerify
        </h1>
        <p className="max-w-2xl mx-auto text-xl mb-8 text-indigo-100">
          A blockchain-powered platform ensuring transparent, fraud-free donations and secure aid distribution.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isSignedIn && (
            <>
              <ActionButton onClick={() => onRoleSelect('donor')}>
                Donate Now
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => onRoleSelect('ngo')}>
                Start an NGO
              </ActionButton>
            </>
          )}
        </div>
      </motion.div>
    </section>
  )
}

// Features Section
const FeaturesSection = () => (
  <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Why AidVerify?</h2>
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 border-0">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <feature.icon className="w-16 h-16 mb-6 text-indigo-600" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </section>
)

// Workflow Section
const WorkflowSection = () => (
  <section id="workflow" className="px-8 py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">How It Works</h2>
    <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
      {workflowSteps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300 border-0 bg-white">
            <CardContent className="flex flex-col items-center p-8 text-center relative">
              <div className="absolute -top-4 left-4 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{index+1}</div>
              <step.icon className="w-16 h-16 mb-6 text-purple-600" />
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.desc}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </section>
)

// Impact Section
const ImpactSection = () => (
  <section id="impact" className="px-8 py-20 max-w-5xl mx-auto text-center">
    <h2 className="text-4xl font-bold mb-16 text-gray-800">Our Impact</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {impactStats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
        >
          <h3 className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</h3>
          <p className="text-gray-600 font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
)

// Footer
const Footer = ({ onRoleSelect }) => (
  <footer className="px-8 py-12 bg-gradient-to-r from-indigo-700 to-purple-700 text-white text-center mt-auto">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Be Part of Transparent Change</h2>
      <p className="text-xl mb-8 text-indigo-100">
        Join AidVerify to ensure your contributions reach the right hands, the right way.
      </p>
      <ActionButton variant="secondary" onClick={() => onRoleSelect('donor')}>
        Get Started Today
      </ActionButton>
      <div className="mt-8 pt-8 border-t border-indigo-500 text-sm text-indigo-200">
        © {new Date().getFullYear()} AidVerify. All rights reserved.
      </div>
    </div>
  </footer>
)

// Main Landing component
export default function Landing() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/signup?role=${role}`);
  };

  // Handle role assignment and redirection
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const userRole = user.publicMetadata?.role;
      
      if (userRole) {
        // User has role, redirect to dashboard
        if (userRole === 'donor') {
          navigate('/home', { replace: true });
        } else if (userRole === 'ngo') {
          navigate('/campaign-application', { replace: true });
        }
      } else {
        // User has no role, check if we can get it from backend or set default
        console.log('User has no role in Clerk, setting default role as donor');
        
        // Call backend to set role
        fetch('http://localhost:3000/api/user/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            role: 'donor'
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Role set successfully via backend');
            // Reload user to get updated metadata
            user.reload().then(() => {
              navigate('/home', { replace: true });
            });
          } else {
            console.error('Failed to set role:', data.message);
          }
        })
        .catch(error => {
          console.error('Error setting role:', error);
        });
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);


  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header onRoleSelect={handleRoleSelect} />
      <HeroSection isSignedIn={isSignedIn} onRoleSelect={handleRoleSelect} />
      <FeaturesSection />
      <WorkflowSection />
      <ImpactSection />
      <Footer onRoleSelect={handleRoleSelect} />
    </div>
  )
}