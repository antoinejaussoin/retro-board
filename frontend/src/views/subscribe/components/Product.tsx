import { useCallback } from 'react';
import { Product, Currency } from 'common';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui/cn';

interface ProductDisplayProps {
  product: Product;
  currency: Currency;
  selected: boolean;
  yearly: boolean;
  onSelect: (product: Product) => void;
}

function ProductDisplay({
  product,
  selected,
  currency,
  yearly,
  onSelect,
}: ProductDisplayProps) {
  const { t } = useTranslation();

  const handleOrder = useCallback(() => {
    onSelect(product);
  }, [onSelect, product]);

  const price =
    yearly && product.recurring
      ? (product[currency] / 100) * 11
      : product[currency] / 100;

  return (
    <button
      type="button"
      onClick={handleOrder}
      className={cn(
        'group flex h-full w-full max-w-sm flex-col overflow-hidden rounded-3xl border-2 bg-cream text-left shadow-card transition-colors sm:w-[300px]',
        selected
          ? 'border-primary-600'
          : 'border-line hover:border-primary-300',
      )}
    >
      <div className="px-6 pt-6 text-center text-2xl font-medium tracking-tight">
        {product.name}
      </div>
      <div className="flex-1 bg-paper px-6 py-4 text-sm leading-6 text-muted">
        {t(`Products.${product.plan}`)}
      </div>
      <div className="flex h-14 items-center justify-center text-lg font-medium text-primary-700">
        {product.seats
          ? t('Products.users', { users: product.seats })
          : `${t('Products.unlimited_seats')} 🎉`}
      </div>
      <div className="bg-primary-700 px-6 py-3 text-center text-2xl font-medium text-white">
        {price.toFixed(2)} {currency.toUpperCase()}
        {product.recurring ? (
          <span className="text-sm font-normal">
            / {yearly ? t('Products.year') : t('Products.month')}
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <div
          className={cn(
            'rounded-full border border-primary-700 px-4 py-2 text-center text-lg font-medium transition-colors',
            selected
              ? 'bg-primary-700 text-white'
              : 'text-primary-700 group-hover:bg-primary-700 group-hover:text-white',
          )}
        >
          {product.recurring
            ? t('SubscribeModal.subscribeButton')
            : t('SubscribeModal.payButton')}
        </div>
      </div>
    </button>
  );
}

export default ProductDisplay;
