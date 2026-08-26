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
        <div className="h-screen bg-bg-dark text-text-light flex flex-col justify-center">
            <Center>
                <div className="w-96 shadow-xl rounded-xl">
                    <Card title="Merchant Portal Login">
                        <div className="pt-6 pb-4">
                            <div className="text-center text-sm text-text-dim mb-6 font-mono">
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
