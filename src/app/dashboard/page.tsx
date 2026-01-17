'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { LogOut, User as UserIcon, Settings, LayoutDashboard, Building2, Clock } from 'lucide-react';
import { BusinessCard } from '@/components/vyapar/BusinessCard';

// Wrapper to fix fetching with token
const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const res = await fetch('/api/v1/users/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Unauthorized');
    }

    return res.json();
};

export default function DashboardPage() {
    const router = useRouter();
    const { data, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        retry: false,
    });

    useEffect(() => {
        if (error) {
            router.push('/login');
        }
    }, [error, router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    const user = data?.user;

    // Mock data for business/waitlist as we haven't implemented specific "get my businesses" API yet
    // In a real scenario, we would fetch this. Only showing structure now.
    const myBusinesses: any[] = [];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
                        <p className="text-muted-foreground">Manage your account and businesses</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="vyapar">My Vyapar</TabsTrigger>
                        <TabsTrigger value="waitlist">Waitlist Status</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Profile Score</CardTitle>
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">85%</div>
                                    <p className="text-xs text-muted-foreground">Complete your profile</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                                    <Building2 className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{myBusinesses.length}</div>
                                    <p className="text-xs text-muted-foreground">Businesses listed on Vyapar</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Task Status</CardTitle>
                                    <Clock className="h-4 w-4 text-orange-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">Pending</div>
                                    <p className="text-xs text-muted-foreground">3 tasks pending in app</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="vyapar">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Your Businesses</h2>
                            <Button onClick={() => router.push('/vyapar/register')}>Add New Business</Button>
                        </div>
                        {myBusinesses.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {myBusinesses.map((b, i) => <BusinessCard key={i} business={b} />)}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-10">
                                    <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                    <p className="text-muted-foreground mb-4">You haven't listed any businesses yet.</p>
                                    <Button variant="outline" onClick={() => router.push('/vyapar/register')}>Register Business</Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="waitlist">
                        <Card>
                            <CardHeader>
                                <CardTitle>Feature Waitlist</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">ThodiBaat Commercial API</h4>
                                        <p className="text-sm text-muted-foreground">Access our APIs for your enterprise.</p>
                                    </div>
                                    <Button variant="secondary" size="sm" disabled>Joined - #402</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <div className="p-2 border rounded bg-muted">{user?.email}</div>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Theme Preference</label>
                                    <div className="p-2 border rounded bg-muted capitalize">{user?.theme || 'System'}</div>
                                </div>
                                <Button variant="outline">Edit Profile</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <Footer />
        </div>
    );
}
