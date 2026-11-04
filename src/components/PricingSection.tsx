import React, { useState } from 'react';
import { PRICING_PLANS } from '../lib/constants';
import { useWedding } from '../context/WeddingContext';
import { Check, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenAuth }) => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const { photographer, updatePhotographerProfile, setCurrentView } = useWedding();
  const [selectedPlanSuccess, setSelectedPlanSuccess] = useState<string | null>(null);

  const handleSelectPlan = (planId: 'starter' | 'pro' | 'agency') => {
    if (photographer) {
      updatePhotographerProfile({ plan: planId });
      setSelectedPlanSuccess(`Your studio plan has been updated to ${planId.toUpperCase()}!`);
      setTimeout(() => setSelectedPlanSuccess(null), 4000);
      setCurrentView({ type: 'dashboard' });
    } else {
      onOpenAuth('register');
    }
  };

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#9A7B4F] uppercase tracking-wider mb-3">
            <span>Simple, Transparent Plans</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
            Fair pricing for photographers of every scale
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Never pay per-guest fees. All plans include unlimited guests, unlimited QR scans, and original resolution downloads.
          </p>

          {/* Billing Interval Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 bg-[#EFEAE1] rounded-xl border border-[#E0D8CB]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnual
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold text-amber-800 bg-[#E8DFC8] px-1.5 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>

          {selectedPlanSuccess && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl max-w-md mx-auto">
              {selectedPlanSuccess}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const isCurrent = photographer?.plan === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all relative ${
                  plan.highlight
                    ? 'bg-white border-2 border-[#9A7B4F] shadow-xl md:-translate-y-2'
                    : 'bg-white border border-[#E8E2D8] shadow-sm hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9A7B4F] to-[#B39364] text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-6">
                    {plan.target}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-serif-luxury font-bold text-slate-900 tabular-nums">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / month {isAnnual ? '(billed annually)' : ''}
                    </span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-[#9A7B4F] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPlan(plan.id as any)}
                    className={`w-full py-3 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-[#9A7B4F] to-[#B39364] hover:from-[#8A6D43] hover:to-[#A38356] text-white shadow-md'
                        : 'bg-[#1E1B18] hover:bg-[#36322D] text-white'
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : plan.ctaText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
