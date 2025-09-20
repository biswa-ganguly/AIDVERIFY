import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Gift, History } from 'lucide-react';

const TokenRewards = () => {
  const { user } = useUser();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTokenData();
    }
  }, [user]);

  const fetchTokenData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tokens/user/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setTokenData(data.data);
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemTokens = async (amount, reason) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tokens/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount, reason })
      });
      
      if (response.ok) {
        fetchTokenData();
        alert('Tokens redeemed successfully!');
      }
    } catch (error) {
      console.error('Error redeeming tokens:', error);
    }
  };

  if (loading) return <div>Loading tokens...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Your Reward Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{tokenData?.totalTokens || 0}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{tokenData?.earnedTokens || 0}</div>
            <div className="text-sm text-muted-foreground">Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{tokenData?.redeemedTokens || 0}</div>
            <div className="text-sm text-muted-foreground">Redeemed</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Button 
            onClick={() => redeemTokens(50, 'Certificate of appreciation')}
            disabled={!tokenData || tokenData.totalTokens < 50}
            className="w-full"
          >
            <Gift className="h-4 w-4 mr-2" />
            Redeem Certificate (50 tokens)
          </Button>
          <Button 
            onClick={() => redeemTokens(100, 'Special donor badge')}
            disabled={!tokenData || tokenData.totalTokens < 100}
            variant="outline"
            className="w-full"
          >
            <Badge className="h-4 w-4 mr-2" />
            Redeem Badge (100 tokens)
          </Button>
        </div>

        {tokenData?.transactions?.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {tokenData.transactions.slice(-5).map((txn, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{txn.reason}</span>
                  <span className={txn.type === 'earned' ? 'text-green-500' : 'text-red-500'}>
                    {txn.type === 'earned' ? '+' : '-'}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenRewards;