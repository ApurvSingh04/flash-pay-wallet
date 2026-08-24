"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Center } from "@repo/ui/center";
import { toast } from "sonner";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!phone || !password) {
            toast.error("Please enter both phone and password");
            return;
        }
        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        const res = await signIn("credentials", {
            phone,
            password,
            redirect: false,
        });

        if (res?.error) {
            toast.error("Incorrect password. If you're new, use your chosen password to create an account.");
            setLoading(false);
        } else {
            toast.success("Successfully logged in!");
            router.push("/dashboard");
        }
    };

    return (
        <div className="h-screen bg-slate-950 text-slate-50 flex flex-col justify-center">
            <Center>
                <div className="w-96 shadow-xl rounded-xl">
                    <Card title="Login to Flash Pay">
                        <div className="pt-2">
                            <TextInput 
                                label="Phone Number" 
                                placeholder="1231231231" 
                                onChange={(val) => setPhone(val)} 
                            />
                            <div className="mt-4">
                                <TextInput 
                                    label="Password" 
                                    type="password"
                                    placeholder="••••••••" 
                                    onChange={(val) => setPassword(val)} 
                                />
                            </div>
                            <div className="pt-6 flex justify-center">
                                <Button onClick={handleLogin}>
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                            </div>
                            <div className="pt-4 text-center text-xs text-slate-500 leading-relaxed">
                                <span className="text-amber-500 font-semibold">New here?</span> Enter your phone number and a password — a new account will be created automatically.<br/>
                                <span className="text-amber-500 font-semibold">Returning?</span> Use the same phone + password you registered with.
                            </div>
                        </div>
                    </Card>
                </div>
            </Center>
        </div>
    );
}
