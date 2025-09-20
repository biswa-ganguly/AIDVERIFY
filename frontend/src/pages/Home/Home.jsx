import React, { useState, useMemo, useLayoutEffect, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from '@/components/DonorNav'; // keep your global navbar


import CampaignFilters from './CampaignFilters';
import Hero from './Hero';
import CampaignCard from './CampaignCard';
import Footer from '../../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const [initialAnimationsRun, setInitialAnimationsRun] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
        const data = response.ok ? await response.json() : [];
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredAndSortedCampaigns = useMemo(() => {
    return campaigns
      .filter(c => {
        // Only show campaigns that are admin verified OR AI verified (or both)
        const isVerified = c.AdminApproval === 'approved' || c.AIApproval === 'verified';
        const categoryMatch = categoryFilter === 'All' || c.category === categoryFilter;
        const searchMatch = searchQuery === '' || 
          c.campaignTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.ngoName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return isVerified && categoryMatch && searchMatch;
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [campaigns, categoryFilter, searchQuery]);

  // Initial animations - run only once
  useLayoutEffect(() => {
    if (initialAnimationsRun) return;
    
    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", { autoAlpha: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.7)' });
      gsap.from(".hero-title", { autoAlpha: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      gsap.from(".hero-subtitle", { autoAlpha: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.4 });
      gsap.from(".filter-controls", { 
        autoAlpha: 0, 
        y: 30, 
        duration: 0.7, 
        delay: 0.6, 
        scrollTrigger: { 
          trigger: ".filter-controls", 
          start: "top 90%" 
        } 
      });
    }, pageRef);
    
    setInitialAnimationsRun(true);
    
    return () => ctx.revert();
  }, [initialAnimationsRun]);

  // Animate cards when campaigns change
  useEffect(() => {
    if (!initialAnimationsRun || !gridRef.current) return;

    const cards = gsap.utils.toArray(gridRef.current.children);
    
    // Clear any existing ScrollTrigger instances for these cards
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger && cards.includes(trigger.vars.trigger)) {
        trigger.kill();
      }
    });
    
    // Set initial state for new cards
    gsap.set(cards, { autoAlpha: 0, y: 50 });
    
    // Create new batch animation
    ScrollTrigger.batch(cards, {
      interval: 0.1,
      batchMax: 3,
      onEnter: batch => gsap.to(batch, { 
        autoAlpha: 1, 
        y: 0, 
        stagger: 0.15, 
        overwrite: true, 
        ease: 'power3.out' 
      }),
      onLeaveBack: batch => gsap.set(batch, { 
        autoAlpha: 0, 
        y: 50, 
        overwrite: true 
      }),
      start: "top 90%",
    });
    
    // Refresh ScrollTrigger to recalculate positions
    ScrollTrigger.refresh();
    
  }, [filteredAndSortedCampaigns, initialAnimationsRun]);

  // Cleanup ScrollTrigger on unmount
  useLayoutEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen  bg-background font-sans antialiased">
      <div className="flex flex-col min-h-screen" ref={pageRef}>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Hero />
          <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <CampaignFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setCategoryFilter={setCategoryFilter}
              campaigns={campaigns}
            />
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-56 rounded-t-xl"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedCampaigns.length > 0 ? (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredAndSortedCampaigns.map(campaign => (
                  <CampaignCard key={campaign._id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 fade-in">
                <h3 className="text-2xl font-semibold text-foreground">No Campaigns Found</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  {searchQuery ? `Your search for "${searchQuery}" in "${categoryFilter}" did not match any campaigns.` : 'No approved campaigns available at the moment.'} Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}