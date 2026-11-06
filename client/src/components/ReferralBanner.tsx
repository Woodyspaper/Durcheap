import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, Users, DollarSign, Star } from 'lucide-react';
import { Link } from 'wouter';

export default function ReferralBanner() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl mb-8">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative px-6 py-8 md:px-12 md:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <Gift className="h-8 w-8 text-yellow-300" />
              <span className="text-2xl md:text-3xl font-bold">Referral Rewards</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Earn <span className="text-yellow-300">1%</span> on Every Referral!
            </h2>
            
            <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl">
              Share Durcheap with friends and earn commission on every purchase they make. 
              It's our way of saying thanks for growing our community!
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <DollarSign className="h-5 w-5 text-green-300" />
                <span className="font-semibold">1% Commission</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-blue-300" />
                <span className="font-semibold">Unlimited Referrals</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-yellow-300" />
                <span className="font-semibold">Instant Rewards</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg">
                  Join & Start Earning
                </Button>
              </Link>
              <Link href="/referral-program">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-3 text-lg"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual Element */}
          <div className="flex-shrink-0 lg:flex-1 lg:max-w-md">
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-purple-600 font-bold text-lg">1%</span>
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-pink-400 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-75">
                <Gift className="h-7 w-7 text-white" />
              </div>
              
              {/* Main Visual */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="text-6xl font-bold text-yellow-300 mb-2">$$$</div>
                <div className="text-xl font-semibold mb-2">Share & Earn</div>
                <div className="text-sm opacity-80">Every referral pays you back</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-300">$50K+</div>
              <div className="text-sm opacity-80">Paid to Referrers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">25K+</div>
              <div className="text-sm opacity-80">Active Referrers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-300">500K+</div>
              <div className="text-sm opacity-80">Successful Referrals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-12 translate-y-12"></div>
    </Card>
  );
}