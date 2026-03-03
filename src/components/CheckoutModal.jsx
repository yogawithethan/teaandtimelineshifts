import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  'pk_live_51T6do8JF5JAOVtlWFLCJyUw5nv08sdoRXIVTiIYLYNJLEp9gWSJKXmlH40voRJW9fBM9pbLCm2bM1W9OuNpwbVjB00ZUl9QOlq'
)

export default function CheckoutModal({ clientSecret, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 520,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.07)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            color: '#555',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >×</button>

        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )
}
