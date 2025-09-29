import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Package, User, ArrowRight } from 'lucide-react';

interface GuestOrder {
  id: number;
  email: string;
  total_amount: number;
  status: string;
  save_details_for_account: boolean;
  created_at: Date;
  items: Array<{
    fragrance_name: string;
    brand_name: string;
    size_label: string;
    quantity: number;
    price_per_item: number;
  }>;
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await backend.guest_orders.get({ id: parseInt(orderId!) });
      setOrder(response);
      setShowAccountCreation(response.save_details_for_account && response.status !== 'account_created');
    } catch (error) {
      console.error('Failed to load order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setCreatingAccount(true);
    
    try {
      const response = await backend.auth.createFromGuest({
        guest_order_id: parseInt(orderId!),
        password: password,
      });
      
      toast({
        title: "Account created!",
        description: response.message,
      });
      
      setShowAccountCreation(false);
      
      // Update order status locally
      if (order) {
        setOrder({ ...order, status: 'account_created' });
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Order not found
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-medium text-gray-900 dark:text-gray-100">
                <Package className="w-5 h-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Order Number</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">#{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {order.status === 'account_created' ? 'Confirmed' : order.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{order.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {order.created_at.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Items Ordered</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {item.brand_name} - {item.fragrance_name}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.size_label} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${(item.price_per_item * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-gray-900 dark:text-gray-100">${order.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Creation */}
          {showAccountCreation && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium text-gray-900 dark:text-gray-100">
                  <User className="w-5 h-5 mr-2" />
                  Create Your Account
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save your details for faster checkout next time
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Create Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 text-base"
                      placeholder="Confirm your password"
                      minLength={6}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={creatingAccount}
                      className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black h-12"
                    >
                      {creatingAccount ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {!showAccountCreation && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Order Processing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We'll process your order within 1-2 business days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Shipping</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your order will be shipped within 3-5 business days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Delivery</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enjoy your new fragrances!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full h-12"
                  >
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}