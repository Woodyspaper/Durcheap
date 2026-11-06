import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-amazon-dark text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_get_to_know_us', 'Get to Know Us')}</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-amazon-orange transition-colors">{t('footer_about_us', 'About Us')}</Link></li>
              <li><Link href="/careers" className="hover:text-amazon-orange transition-colors">{t('footer_careers', 'Careers')}</Link></li>
              <li><Link href="/press" className="hover:text-amazon-orange transition-colors">{t('footer_press_releases', 'Press Releases')}</Link></li>
              <li><Link href="/investors" className="hover:text-amazon-orange transition-colors">{t('footer_investor_relations', 'Investor Relations')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_make_money_with_us', 'Make Money with Us')}</h3>
            <ul className="space-y-2">
              <li><Link href="/seller" className="hover:text-amazon-orange transition-colors">{t('footer_sell_on_durcheap', 'Sell on Durcheap')}</Link></li>
              <li><Link href="/subscription" className="hover:text-amazon-orange transition-colors">{t('footer_seller_plans', 'Seller Subscription Plans')}</Link></li>
              <li><Link href="/referral-program" className="hover:text-amazon-orange transition-colors">{t('footer_referral_program', 'Referral Program')}</Link></li>
              <li><Link href="/advertise-products" className="hover:text-amazon-orange transition-colors">{t('footer_advertise_products', 'Advertise Your Products')}</Link></li>
              <li><Link href="/event-advertising" className="hover:text-amazon-orange transition-colors">{t('footer_event_advertising', 'Event Advertising')}</Link></li>
              <li><Link href="/all-options" className="hover:text-amazon-orange transition-colors">{t('footer_see_all_options', 'See All Options')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_payment_products', 'Payment Products')}</h3>
            <ul className="space-y-2">

              <li><Link href="/reload" className="hover:text-amazon-orange transition-colors">{t('footer_reload_balance', 'Reload Your Balance')}</Link></li>
              <li><Link href="/currency" className="hover:text-amazon-orange transition-colors">{t('footer_currency_converter', 'Currency Converter')}</Link></li>
              <li><Link href="/crypto" className="hover:text-amazon-orange transition-colors">{t('footer_crypto_converter', 'Crypto Converter')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer_let_us_help_you', 'Let Us Help You')}</h3>
            <ul className="space-y-2">
              <li><Link href="/account" className="hover:text-amazon-orange transition-colors">{t('footer_your_account', 'Your Account')}</Link></li>
              <li><Link href="/orders" className="hover:text-amazon-orange transition-colors">{t('footer_your_orders', 'Your Orders')}</Link></li>
              <li><Link href="/customer-service" className="hover:text-amazon-orange transition-colors">{t('customer_service', 'Customer Service')}</Link></li>
              <li><Link href="/shipping" className="hover:text-amazon-orange transition-colors">{t('footer_shipping_rates', 'Shipping Rates')}</Link></li>
              <li><Link href="/help" className="hover:text-amazon-orange transition-colors">{t('footer_returns_replacements', 'Returns & Replacements')}</Link></li>
              <li><Link href="/faq" className="hover:text-amazon-orange transition-colors">{t('footer_faq', 'FAQ')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-amazon-blue mt-8 pt-8 text-center">
          <p>&copy; 2024 {t('footer_copyright', 'Durcheap. All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
}