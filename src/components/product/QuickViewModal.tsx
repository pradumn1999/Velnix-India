import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag, ExternalLink, ShieldCheck, Truck } from 'lucide-react';
import { useQuickView } from '../../context/QuickViewContext';
import { useCart } from '../../context/CartContext';
import { Modal } from '../common/Modal';
import { RatingStars } from '../common/RatingStars';
import { PriceDisplay } from '../common/PriceDisplay';
import { QuantitySelector } from '../common/QuantitySelector';
import { Button } from '../common/Button';

export const QuickViewModal: React.FC = () => {
  const { activeProduct, closeQuickView } = useQuickView();
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // When product changes, reset selections
  React.useEffect(() => {
    if (activeProduct) {
      setSelectedImage(0);
      setQuantity(1);
      const initialVariants: Record<string, string> = {};
      activeProduct.variants.forEach((v) => {
        if (v.options.length > 0) {
          initialVariants[v.name] = v.options[0];
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [activeProduct]);

  if (!activeProduct) return null;

  const handleVariantChange = (name: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: option }));
  };

  const handleAddToCart = () => {
    addToCart(activeProduct, quantity, selectedVariants);
    closeQuickView();
  };

  return (
    <Modal isOpen={!!activeProduct} onClose={closeQuickView} maxWidth="4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
            <img
              src={activeProduct.images[selectedImage] || activeProduct.images[0]}
              alt={activeProduct.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>

          {activeProduct.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx ? 'border-neutral-900 shadow-xs' : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${activeProduct.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Selection */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {activeProduct.category.replace('-', ' ')}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-1 leading-snug">
              {activeProduct.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <RatingStars rating={activeProduct.rating} reviewCount={activeProduct.reviewCount} showNumber />
              <span className="text-xs text-neutral-300">|</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                In Stock ({activeProduct.stock} units left)
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <PriceDisplay
              price={activeProduct.price}
              originalPrice={activeProduct.originalPrice}
              discount={activeProduct.discount}
              size="lg"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Inclusive of all taxes. Free Express Delivery across India on orders above ₹999.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed">
            {activeProduct.description}
          </p>

          {/* Variants */}
          {activeProduct.variants.map((variant) => (
            <div key={variant.id} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {variant.name}: <span className="font-normal text-neutral-900">{selectedVariants[variant.name]}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((opt) => {
                  const isSelected = selectedVariants[variant.name] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleVariantChange(variant.name, opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 text-neutral-800 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity & CTA */}
          <div className="flex items-center gap-3 pt-2">
            <QuantitySelector
              quantity={quantity}
              max={activeProduct.stock}
              onChange={setQuantity}
            />

            <Button
              variant="primary"
              className="flex-1"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>

          {/* Highlights & View Full Page */}
          <div className="pt-3 border-t border-neutral-200 flex flex-col gap-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>{activeProduct.shippingInfo.dispatchTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{activeProduct.returnPolicy}</span>
            </div>
          </div>

          <Link
            to={`/product/${activeProduct.id}`}
            onClick={closeQuickView}
            className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 inline-flex items-center gap-1 mt-1 transition-colors"
          >
            <span>View Full Product Specifications & Customer Reviews</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Modal>
  );
};
