import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/Button';
import { T, Emoji } from '@/shared/components/TypographyScale';

interface PurchaseModalProps {
  show: boolean;
  itemName: string;
  itemIcon: string;
  price: number;
  userCoins: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  show,
  itemName,
  itemIcon,
  price,
  userCoins,
  onConfirm,
  onCancel
}) => {
  const canAfford = userCoins >= price;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/80"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-[280px] sm:w-[320px] text-center mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-3">
              <Emoji className="text-2xl">{itemIcon}</Emoji>
            </div>

            <T size="base" bold as="h2" className="mb-1">
              ¿Quieres comprar?
            </T>

            <T size="sm" color="muted" className="mb-4">
              {itemName}
            </T>

            <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <Emoji>⭐</Emoji>
              <T size="base" bold color="warning">
                {price}
              </T>
              <T size="xs" color="muted">
                (tienes {userCoins})
              </T>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={onCancel}
              >
                No
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={onConfirm}
                disabled={!canAfford}
              >
                Sí
              </Button>
            </div>

            {!canAfford && (
              <T size="micro" color="danger" bold className="mt-3 block">
                No tienes suficientes monedas
              </T>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
