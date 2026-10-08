import {
  Coffee, Braces, Database, Server, Route, Webhook, KeyRound, ShieldCheck, Atom, Code2, Palette, Wind, Table2,
  Gauge, ArrowLeftRight, Container, Layers, GitBranch, Github, Workflow, Binary, Cpu, Network, Boxes, Terminal,
  Cloud, Zap, Wrench, BookOpen, Brain, Globe, Mail, Linkedin, Twitter, Link2, Lock, Smartphone, FileCode2,
  Puzzle, Bug, Rocket, GitMerge,
} from 'lucide-react';

/** Skill icons selectable from the admin dashboard (stored by name in MySQL). */
export const skillIcons = {
  Coffee, Braces, Database, Server, Route, Webhook, KeyRound, ShieldCheck, Atom, Code2, Palette, Wind, Table2,
  Gauge, ArrowLeftRight, Container, Layers, GitBranch, Github, Workflow, Binary, Cpu, Network, Boxes, Terminal,
  Cloud, Zap, Wrench, BookOpen, Brain, Globe, Lock, Smartphone, FileCode2, Puzzle, Bug, Rocket, GitMerge,
};

export const socialIcons = { github: Github, linkedin: Linkedin, email: Mail, twitter: Twitter, website: Globe, other: Link2 };
export const socialPlatforms = Object.keys(socialIcons);

export const SkillIcon = ({ name, ...props }) => {
  const Icon = skillIcons[name] || Code2;
  return <Icon aria-hidden="true" {...props} />;
};

export const SocialIcon = ({ platform, ...props }) => {
  const Icon = socialIcons[platform] || Link2;
  return <Icon aria-hidden="true" {...props} />;
};
