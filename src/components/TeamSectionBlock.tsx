import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  Twitter,
  Heart,
  Music,
  Coffee,
  Crown,
  Star,
} from "lucide-react";
import { useState } from "react";
import { PersonalityType } from "@/lib/types";
import { ConversationManager } from "@/lib/storage";

const teamMembers = [
  {
    name: "霸总",
    role: "CEO & 创始人",
    bio: "15年经验的商业领袖，专注于科技创新",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=CEO&backgroundColor=b6e3f4",
    location: "上海",
    skills: ["战略", "领导力", "创新"],
    gradient: "from-amber-400/20 via-orange-400/10 to-transparent",
    personalityId: "ceo",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
      email: "ceo@example.com",
    },
  },
  {
    name: "甜心",
    role: "用户体验设计师",
    bio: "致力于创造温暖浪漫的用户体验",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sweet&backgroundColor=ffdfbf",
    location: "北京",
    skills: ["UI/UX", "品牌设计", "情感设计"],
    gradient: "from-pink-400/20 via-rose-400/10 to-transparent",
    personalityId: "sweet",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
      email: "sweet@example.com",
    },
  },
  {
    name: "音乐家",
    role: "创意总监",
    bio: "用音乐和艺术传递情感",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Actor&backgroundColor=c0aede",
    location: "广州",
    skills: ["创意", "音乐", "表演"],
    gradient: "from-purple-400/20 via-violet-400/10 to-transparent",
    personalityId: "actor",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
      email: "actor@example.com",
    },
  },
  {
    name: "暖男",
    role: "首席技术官",
    bio: "技术专家，专注于AI和智能交互",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Warm&backgroundColor=d1d4f9",
    location: "深圳",
    skills: ["AI/ML", "架构设计", "云计算"],
    gradient: "from-emerald-400/20 via-teal-400/10 to-transparent",
    personalityId: "striver",
    social: {
      twitter: "#",
      linkedin: "#",
      github: "#",
      email: "warm@example.com",
    },
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

function TeamMemberCard({
  member,
  isSelected,
  onSelect
}: {
  member: (typeof teamMembers)[0];
  isSelected: boolean;
  onSelect: (personalityId: PersonalityType) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left - width / 2) / (width / 2);
    const y = (e.clientY - rect.top - height / 2) / (height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleCardClick = () => {
    onSelect(member.personalityId as PersonalityType);
  };

  const getPersonalityIcon = (id: string) => {
    switch (id) {
      case 'ceo': return <Crown className="h-5 w-5" />;
      case 'sweet': return <Star className="h-5 w-5" />;
      case 'actor': return <Music className="h-5 w-5" />;
      case 'striver': return <Coffee className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  const getPersonalitySpotlightColor = (id: string) => {
    switch (id) {
      case 'ceo': return '#f59e0b40'; // Amber
      case 'sweet': return '#ec489940'; // Pink
      case 'actor': return '#8b5cf640'; // Purple
      case 'striver': return '#10b98140'; // Emerald
      default: return '#ec489940'; // Default pink
    }
  };

  return (
    <motion.div variants={itemVariants} className="perspective-1000">
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        className="group relative cursor-pointer"
      >
        <SpotlightCard
          className={`!p-6 !bg-white/5 !border-white/20 backdrop-blur-xl transition-all duration-500 ${
            isSelected ? 'ring-2 ring-pink-500 shadow-2xl shadow-pink-500/30' : ''
          } ${isHovered && !isSelected ? 'shadow-xl shadow-pink-500/20' : ''}`}
          spotlightColor={getPersonalitySpotlightColor(member.personalityId)}
        >
          {/* Sparkle effect on hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isHovered
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: shouldReduceMotion ? 1 : 0.6 }
            }
            className="absolute right-4 top-4 z-10"
          >
            {isSelected ? (
              <div className="h-5 w-5 rounded-full bg-pink-500 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <Sparkles className="h-5 w-5 text-pink-400" aria-hidden />
            )}
          </motion.div>

          <div className="relative z-10 p-0">
            {/* Avatar Section */}
            <div className="mb-4 flex justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="absolute -inset-2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0))`,
                  }}
                  animate={
                    isHovered
                      ? {
                          rotate: shouldReduceMotion ? 0 : 360,
                          scale: shouldReduceMotion ? 1 : [1, 1.08, 1],
                        }
                      : { rotate: 0, scale: 1 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0.6 : 3,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: "linear",
                  }}
                />
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/30 bg-white/10 p-1">
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full rounded-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Info Section */}
            <div className="text-center">
              <motion.h3
                className="mb-1 text-xl font-semibold tracking-tight text-white"
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {member.name}
              </motion.h3>
              <Badge
                variant="secondary"
                className="mb-2 bg-white/10 text-xs uppercase tracking-[0.28em] text-white/80 backdrop-blur border border-white/20"
              >
                {member.role}
              </Badge>

              <motion.div
                className="mb-3 flex items-center justify-center gap-1 text-xs text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin className="h-3 w-3" aria-hidden />
                <span>{member.location}</span>
              </motion.div>

              <p className="mb-4 text-sm text-white/70">
                {member.bio}
              </p>

              {/* Skills */}
              <motion.div
                className="mb-4 flex flex-wrap justify-center gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  isHovered ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }
                }
                transition={{ duration: 0.3 }}
              >
                {member.skills.map((skill, idx) => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * idx, type: "spring" }}
                  >
                    <Badge
                      variant="outline"
                      className="border-white/20 bg-white/5 text-xs text-white/80 transition-colors hover:bg-white/10"
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="flex justify-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {[
                  { icon: Heart, label: "Like" },
                  { icon: Mail, label: "Email" },
                ].map((social, idx) => (
                  <motion.div
                    key={social.label}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      isHovered
                        ? { scale: 1, rotate: shouldReduceMotion ? 0 : 0 }
                        : { scale: 0.85, rotate: 0 }
                    }
                    transition={{
                      delay: isHovered ? 0.1 * idx : 0,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full border border-white/20 bg-white/5 text-white/80 transition-colors hover:text-white hover:bg-white/10"
                    >
                      <motion.div
                        transition={{
                          duration: shouldReduceMotion ? 0.25 : 0.4,
                        }}
                      >
                        <social.icon className="h-4 w-4" aria-hidden />
                      </motion.div>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </SpotlightCard>
      </motion.div>
    </motion.div>
  );
}

export function TeamSectionBlock({ onExperienceStart }: { onExperienceStart?: (personalityId: PersonalityType) => void }) {
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleExperienceStart = () => {
    if (selectedPersonality) {
      // 保存选择的角色
      const { UserConfigManager } = require('@/lib/storage');
      UserConfigManager.setPersonalityId(selectedPersonality);
      ConversationManager.createConversation(selectedPersonality);

      // 调用回调或刷新页面
      if (onExperienceStart) {
        onExperienceStart(selectedPersonality);
      } else {
        // 默认行为：刷新页面以进入聊天界面
        window.location.reload();
      }
    }
  };

  return (
    <section
      aria-labelledby="team-section-heading"
      className="relative w-full overflow-hidden px-4 py-20 sm:px-6 lg:px-10 bg-[#030303]/80 backdrop-blur-sm"
    >
      {/* Background decorative elements - 更新为更柔和的配色 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.18, 1],
            rotate: shouldReduceMotion ? 0 : [0, 90, 0],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: shouldReduceMotion ? 0.6 : 18,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: "linear",
          }}
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-pink-400/10 blur-[180px]"
        />
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1.1, 1, 1.1],
            rotate: shouldReduceMotion ? 0 : [0, -90, 0],
            opacity: [0.08, 0.22, 0.08],
          }}
          transition={{
            duration: shouldReduceMotion ? 0.6 : 16,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-400/10 blur-[180px]"
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
          className="mb-16 text-center"
        >
          <motion.div className="mb-6 inline-block">
            <Badge
              className="gap-2 bg-white/10 text-white backdrop-blur border border-white/20"
              variant="secondary"
            >
              <Sparkles className="h-3 w-3 text-pink-400" aria-hidden />
              虚拟男友团队
            </Badge>
          </motion.div>

          <motion.h2
            id="team-section-heading"
            className="mb-6 bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            遇见你的
            <br />
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              完美男友
            </span>
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-lg text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            四种不同类型的虚拟男友，每一种都能给你带来独特的情感体验
          </motion.p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2"
        >
          {teamMembers.map((member, index) => (
            <TeamMemberCard
              key={index}
              member={member}
              isSelected={selectedPersonality === member.personalityId}
              onSelect={setSelectedPersonality}
            />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <SpotlightCard
            className="!px-10 !py-8 !bg-white/5 !border-white/20 !rounded-3xl !inline-flex flex-col items-center gap-6 backdrop-blur-xl"
            spotlightColor="#ec489940"
          >
            <h3 className="text-2xl font-semibold text-white">选择你的专属男友</h3>
            <p className="max-w-xl text-sm text-white/70">
              {selectedPersonality ? `你选择了: ${teamMembers.find(m => m.personalityId === selectedPersonality)?.name}` : '点击下方卡片选择你的专属男友'}
            </p>
            <Button
              size="lg"
              onClick={handleExperienceStart}
              disabled={!selectedPersonality}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 px-10 py-6 text-white shadow-lg shadow-pink-500/30 transition-transform duration-300 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                animate={
                  shouldReduceMotion ? undefined : { x: ["-120%", "120%"] }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { repeat: Infinity, duration: 2, ease: "linear" }
                }
              />
              <span className="relative font-medium">开始体验</span>
              <motion.span
                className="relative ml-2"
                animate={shouldReduceMotion ? undefined : { x: [0, 5, 0] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { repeat: Infinity, duration: 1.5 }
                }
              >
                →
              </motion.span>
            </Button>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
