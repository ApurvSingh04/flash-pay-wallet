"use client";
import { signIn } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";

export default function Login() {
    const handleGoogleLogin = async () => {
        await signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="h-screen bg-slate-950 text-slate-50 flex flex-col justify-center">
            <Center>
                <div className="w-96 shadow-xl rounded-xl">
                    <Card title="Merchant Portal Login">
                        <div className="pt-6 pb-4">
                            <div className="text-center text-sm text-slate-500 mb-6">
                                Access your merchant dashboard to manage transactions and payouts securely.
                            </div>
                            <div className="flex justify-center">
                                <Button onClick={handleGoogleLogin}>
                                    Sign in with Google
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </Center>
        </div>
    );
}
