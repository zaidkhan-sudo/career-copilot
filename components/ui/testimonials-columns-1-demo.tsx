import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials: Testimonial[] = [
  {
    text: "CareerPilot cut my weekly job-search time from 12 hours to about 3. The Scout and Analyzer agents surfaced roles I would have missed and explained exactly why they matched.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Aisha Patel",
    role: "Final-Year CS Student",
  },
  {
    text: "I stopped sending generic resumes. Writer now gives me a tailored version for each role, and my callback rate went from almost zero to consistent recruiter replies.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Marcus Lee",
    role: "Junior Full-Stack Developer",
  },
  {
    text: "The interview simulations feel real. Coach interrupted me like an actual interviewer, flagged my weak answers, and my behavioral rounds got way more confident.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Nadia Khan",
    role: "Frontend Engineer (0-2 YOE)",
  },
  {
    text: "The daily digest is my favorite part. Instead of doom-scrolling boards, I wake up to the top matches, fit scores, and what to apply for first.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Daniel Ortiz",
    role: "Backend Developer",
  },
  {
    text: "I switched from mechanical engineering to software and felt lost. CareerPilot's feedback loop helped me fix role targeting and finally land interviews in tech.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Sofia Rahman",
    role: "Career Switcher",
  },
  {
    text: "When I marked rejections, the system adapted. After a few weeks, it changed my resume framing and job filters, and I started getting assessment links.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Ethan Walker",
    role: "Software Engineer",
  },
  {
    text: "I used to apply late. Scout now flags fresh postings under 24 hours, and being early made a huge difference in response rates.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Ravi Menon",
    role: "Recent Graduate",
  },
  {
    text: "The transparency is rare. Every recommendation shows reasoning, so I understand why a role is high fit instead of trusting a black-box score.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Hina Siddiqui",
    role: "Product-Minded Developer",
  },
  {
    text: "I got two offers in one cycle after using the AI team for applications plus mock interviews. It feels like having a real career squad working 24/7.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Noah Bennett",
    role: "Early-Career Developer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function Testimonials() {
  return (
    <section className="bg-background my-0 py-32 relative px-6">
      <div className="z-10 mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-zinc-500/70 py-1 px-4 rounded-lg text-[var(--color-text-primary)]">Testimonials</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-[var(--color-text-primary)] [text-shadow:0_0_20px_var(--color-text-glow)]">
            What our <span className="text-amber-300">users</span> say
          </h2>
          <p className="text-center mt-5 text-[var(--color-text-secondary)] opacity-90">
            See what our customers have to say about us.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
