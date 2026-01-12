import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Brain, Languages, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/progress`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Quiz Builder',
      description: 'Generate AI-powered quizzes on any subject',
      icon: BookOpen,
      link: '/quiz',
      color: 'bg-primary',
      image: 'https://images.unsplash.com/photo-1760140286145-6a0d5be5da11?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      title: 'Study Buddy',
      description: 'Get step-by-step explanations for any concept',
      icon: Brain,
      link: '/study',
      color: 'bg-accent',
      image: 'https://images.unsplash.com/photo-1763890965393-1cea435581ab?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
    {
      title: 'Language Tutor',
      description: 'Learn languages with cultural context',
      icon: Languages,
      link: '/language',
      color: 'bg-secondary',
      image: 'https://images.unsplash.com/photo-1658822069505-a8839dda9627?crop=entropy&cs=srgb&fm=jpg&q=85',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight" data-testid="hero-title">
              Welcome to Your Learning Journey
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Master any subject with AI-powered quizzes, personalized explanations, and language learning tools
            </p>
          </div>

          {/* Stats Grid */}
          {!loading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" data-testid="stats-grid">
              <Card className="bg-card border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm uppercase tracking-wide">Quizzes Taken</CardDescription>
                  <CardTitle className="text-4xl font-serif" data-testid="total-quizzes">{stats.total_quizzes}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm uppercase tracking-wide">Concepts Studied</CardDescription>
                  <CardTitle className="text-4xl font-serif" data-testid="total-study-sessions">{stats.total_study_sessions}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardDescription className="text-sm uppercase tracking-wide">Phrases Translated</CardDescription>
                  <CardTitle className="text-4xl font-serif" data-testid="total-translations">{stats.total_translations}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Features Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.link} data-testid={`feature-card-${feature.title.toLowerCase().replace(' ', '-')}`}>
                  <Card className="group h-full bg-card hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border-border/50 cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                      <div className={`absolute bottom-4 left-4 ${feature.color} w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-serif text-2xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all duration-300">
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Recent Activity */}
          {!loading && stats && stats.recent_activities && stats.recent_activities.length > 0 && (
            <Card className="bg-card border-border/50" data-testid="recent-activity-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  <CardTitle className="font-serif text-2xl">Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recent_activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0" data-testid={`activity-item-${index}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'quiz' ? 'bg-primary' :
                          activity.type === 'study' ? 'bg-accent' : 'bg-secondary'
                        }`} />
                        <span className="text-foreground">{activity.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;