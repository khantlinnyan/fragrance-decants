import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Lock, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import { AddressAutocomplete } from '../components/AddressAutocomplete';

interface GuestCartItem {
  id: number;
  fragrance_id: number;
  fragrance_name: string;
  brand_name: string;
  decant_size_id: number;
  size_label: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
}

interface CheckoutFormData {
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
  save_details_for_account: boolean;
}

export default function GuestCheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'United States',
    phone: '',
    save_details_for_account: false,
  });

  const sessionId = sessionStorage.getItem('guest_session_id') || 
    (() => {
      const newId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('guest_session_id', newId);
      return newId;
    })();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await backend.guest_cart.get({ session_id: sessionId });
      setItems(response.items);
      setTotalAmount(response.total_amount);
      
      if (response.items.length === 0) {
        navigate('/');
        toast({
          title: "Cart is empty",
          description: "Please add items to your cart before checking out.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (address: any) => {
    setFormData(prev => ({
      ...prev,
      address_line1: address.address_line1,
      city: address.city,
      state_province: address.state_province,
      postal_code: address.postal_code,
      country: address.country,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        session_id: sessionId,
        email: formData.email,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || undefined,
        city: formData.city,
        state_province: formData.state_province,
        postal_code: formData.postal_code,
        country: formData.country,
        phone: formData.phone || undefined,
        save_details_for_account: formData.save_details_for_account,
        items: items.map(item => ({
          fragrance_id: item.fragrance_id,
          decant_size_id: item.decant_size_id,
          quantity: item.quantity,
        })),
      };

      const order = await backend.guest_orders.create(orderData);
      
      toast({
        title: "Order created successfully!",
        description: `Order #${order.id} has been created.`,
      });
      
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const estimatedShipping = 8.99;
  const grandTotal = totalAmount + estimatedShipping;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Information</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">Payment</span>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 tracking-wide">
            Guest Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact & Delivery Block */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    Contact & Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-12 text-base"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Account Option */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="save_details"
                      checked={formData.save_details_for_account}
                      onCheckedChange={(checked) => handleInputChange('save_details_for_account', checked as boolean)}
                    />
                    <Label htmlFor="save_details" className="text-sm text-gray-600 dark:text-gray-400">
                      Optional: Save your details for faster checkout next time
                    </Label>
                  </div>

                  <Separator />

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <AddressAutocomplete
                        label="Address Line 1"
                        value={formData.address_line1}
                        onChange={(value) => handleInputChange('address_line1', value)}
                        onAddressSelect={handleAddressSelect}
                        placeholder="Start typing your address..."
                        required
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address_line2" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address Line 2
                      </Label>
                      <Input
                        id="address_line2"
                        value={formData.address_line2}
                        onChange={(e) => handleInputChange('address_line2', e.target.value)}
                        className="h-12 text-base"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        City *
                      </Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state_province" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        State/Province *
                      </Label>
                      <Input
                        id="state_province"
                        required
                        value={formData.state_province}
                        onChange={(e) => handleInputChange('state_province', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Postal Code *
                      </Label>
                      <Input
                        id="postal_code"
                        required
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country *
                      </Label>
                      <Input
                        id="country"
                        required
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="h-12 text-base"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-base font-medium tracking-wide"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {item.brand_name} - {item.fragrance_name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.size_label} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${item.total_price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-gray-100">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estimated Shipping</span>
                    <span className="text-gray-900 dark:text-gray-100">${estimatedShipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-gray-900 dark:text-gray-100">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                {/* Security Badges */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Secure Payment Processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">All Major Cards Accepted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Fast & Secure Shipping</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="pt-2">
                  <div className="flex space-x-2 justify-center opacity-60">
                    <Badge variant="outline" className="text-xs">VISA</Badge>
                    <Badge variant="outline" className="text-xs">MC</Badge>
                    <Badge variant="outline" className="text-xs">AMEX</Badge>
                    <Badge variant="outline" className="text-xs">PayPal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}