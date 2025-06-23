import "./App.css";
import { motion } from "framer-motion";
import { Play, BookOpen, Volume2, Sparkles } from "lucide-react";

function App() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="min-h-screen animated-gradient">
      {/* Subtle floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-[#ffb3a7] to-[#ffc4b5] rounded-full opacity-10 blur-xl"
          animate={{
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-to-r from-[#ff9999] to-[#ffb3a7] rounded-full opacity-8 blur-2xl"
          animate={{
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <motion.span
              className="text-7xl md:text-9xl font-light bg-gradient-to-r from-[#2d3748] via-[#ff9999] to-[#2d3748] bg-clip-text text-transparent block mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              話す
            </motion.span>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-5xl font-light text-[#2d3748] mb-8 tracking-wide"
            variants={itemVariants}
          >
            hanasu
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-[#4a5568] mb-16 max-w-2xl mx-auto font-light leading-relaxed"
            variants={itemVariants}
          >
            transform manga into immersive audiobooks
          </motion.p>

          <motion.div
            className="flex justify-center gap-6"
            variants={itemVariants}
          >
            <motion.button
              className="bg-gradient-to-r from-[#ffb3a7] to-[#ff9999] text-white px-10 py-4 rounded-full font-light text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              start listening
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-32 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-light text-[#2d3748] mb-4 tracking-wide">
              simple. elegant. powerful.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: BookOpen,
                title: "upload",
                desc: "drop your manga pages",
              },
              {
                icon: Sparkles,
                title: "process",
                desc: "ai reads and understands",
              },
              {
                icon: Volume2,
                title: "listen",
                desc: "high-quality narration",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <feature.icon className="w-7 h-7 text-[#ff9999]" />
                </motion.div>
                <h3 className="text-lg font-light text-[#2d3748] mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-[#4a5568] font-light leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Demo Section */}
      <motion.section
        className="py-32 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-white/40 backdrop-blur-sm rounded-3xl p-12 shadow-xl"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-[#ffb3a7] to-[#ff9999] rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Volume2 className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-light text-[#2d3748] mb-4 tracking-wide">
                experience the magic
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-[#ffb3a7] to-[#ff9999] h-2 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "60%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
              <p className="text-[#4a5568] font-light italic">
                "chapter one: the beginning of an extraordinary adventure..."
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="py-32 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-light text-[#2d3748] mb-8 tracking-wide">
              ready to transform your reading?
            </h2>
            <motion.button
              className="bg-gradient-to-r from-[#ffb3a7] to-[#ff9999] text-white px-12 py-5 rounded-full font-light text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              begin your journey
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default App;
