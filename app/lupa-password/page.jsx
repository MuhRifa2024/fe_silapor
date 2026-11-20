"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword, verifyOTP, resetPassword } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Mail, KeyRound, Lock, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import PasswordStrengthIndicator, { isPasswordStrong } from "@/components/ui/PasswordStrengthIndicator";

export default function LupaPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Input Identifier, 2: Input OTP, 3: New Password
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(900); // 15 mins

  // Countdown timer for Step 2
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!identifier.trim()) {
      setErrorMessage("Silakan masukkan username atau email Anda");
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword({ identifier: identifier.trim() });
      toast.success("Kode OTP berhasil dikirim!");
      if (res.data?.email) {
        setMaskedEmail(res.data.email);
      }
      setCountdown(900);
      setStep(2);
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal memproses permintaan reset password";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage("Masukkan 6 digit kode OTP yang dikirimkan ke email Anda");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOTP({ identifier: identifier.trim(), otp: otp.trim() });
      if (res.data?.reset_token) {
        setResetToken(res.data.reset_token);
        toast.success("Verifikasi OTP berhasil! Silakan tentukan kata sandi baru.");
        setStep(3);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Kode OTP salah atau sudah kedaluwarsa";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isPasswordStrong(newPassword)) {
      setErrorMessage("Password harus memenuhi seluruh kombinasi kriteria keamanan");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ reset_token: resetToken, new_password: newPassword });
      toast.success("Kata sandi berhasil direset! Silakan login.");
      router.push("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal mereset kata sandi";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-start p-6 sm:p-12 md:p-24 overflow-hidden bg-slate-50">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/silapor_bg_light.png" 
          alt="Campus daytime" 
          fill
          className="object-cover opacity-100"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="z-10 w-full max-w-md flex flex-col gap-5"
      >
        {/* Header / Brand */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shadow-sm border border-indigo-200">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-widest uppercase">
              <span className="text-orange-500">Si</span>
              <span className="text-indigo-600">Lapor</span>
            </h1>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Pemulihan Akun
          </h2>
          <p className="text-slate-600 text-sm">
            Atur ulang kata sandi akun pelapor atau petugas kampus Anda.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2">
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 3 ? "bg-indigo-600" : "bg-slate-200"}`} />
        </div>

        {/* Card Form */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleRequestOTP}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="identifier" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">
                    USERNAME / NIM / EMAIL
                  </Label>
                  <div className="relative">
                    <Input
                      id="identifier"
                      placeholder="Masukkan username atau email terdaftar"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="bg-white/60 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 pl-10"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Kode verifikasi (OTP) akan dikirimkan ke alamat email pemulihan yang terdaftar di akun ini.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all mt-2"
                >
                  {isLoading ? "MENGIRIMKAN OTP..." : "KIRIM KODE OTP"}
                </Button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleVerifyOTP}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="otp" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">
                      KODE VERIFIKASI (OTP)
                    </Label>
                    <span className="text-xs font-semibold text-indigo-600 font-mono">
                      {formatTimer(countdown)}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="6 digit angka"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      className="bg-white/60 border-slate-200 text-slate-900 text-center font-bold tracking-[6px] text-xl h-12 rounded-xl focus:border-indigo-500/50"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Cek email <strong>{maskedEmail}</strong> Anda (termasuk folder spam).
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setStep(1); setErrorMessage(""); }}
                    className="flex-1 h-11 rounded-xl text-slate-700"
                  >
                    Kembali
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
                  >
                    {isLoading ? "MEMERIKSA..." : "VERIFIKASI"}
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">
                    KATA SANDI BARU
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/60 border-slate-200 text-slate-900 h-11 rounded-xl pl-10"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <PasswordStrengthIndicator password={newPassword} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">
                    KONFIRMASI KATA SANDI
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/60 border-slate-200 text-slate-900 h-11 rounded-xl pl-10"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md mt-2"
                >
                  {isLoading ? "MENYIMPAN..." : "SIMPAN KATA SANDI BARU"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-slate-200/60 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke halaman Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
