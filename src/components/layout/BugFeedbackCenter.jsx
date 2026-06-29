'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Upload, Mic, Square, Play, Trash2, CheckCircle2, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/apiClient';

export default function BugFeedbackCenter({ isOpen, onClose }) {
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  
  // Voice Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordTime, setRecordTime] = useState(0);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Clean up timers/URLs on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordTime(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Microphone active. Recording started...');
    } catch (err) {
      console.error('Mic access denied:', err);
      toast.error('Microphone access denied. Voice feedback not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks to release mic hardware lock
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('Recording complete!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be smaller than 5MB');
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotPreview('');
  };

  const clearAudio = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl('');
    setRecordTime(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please write a message explaining the issue.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('category', category);
    formData.append('message', message);
    if (screenshot) {
      formData.append('screenshot', screenshot);
    }
    if (audioBlob) {
      formData.append('audio', audioBlob, 'feedback_recording.webm');
    }

    try {
      const res = await apiClient.post('/feedbacks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        setSuccess(true);
        toast.success('Bug & Feedback submitted successfully!');
        setMessage('');
        clearScreenshot();
        clearAudio();
        // Fire custom event to refresh lists if open
        window.dispatchEvent(new CustomEvent('vital_feedback_submitted'));
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020703]/80  z-[100] cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#071910] border-l border-emerald-900/5 shadow-2xl z-[110] flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-emerald-900/5 flex items-center justify-between bg-emerald-950/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] animate-pulse">
                  <AlertTriangle size={18} />
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm uppercase tracking-widest text-emerald-950 flex items-center gap-1.5">
                    Feedback & Bug Center <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mt-0.5">Enterprise diagnostic link</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/60 border border-emerald-900/5 hover:border-emerald-900/10 flex items-center justify-center text-neutral-400 hover:text-emerald-950 cursor-pointer transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-left custom-scrollbar">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
                  <CheckCircle2 className="w-16 h-16 text-[#10B981]" />
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-sm">Thank You for Helping Us Grow!</h4>
                  <p className="text-neutral-500 text-xs leading-relaxed max-w-xs font-mono uppercase">Your diagnostics have been securely compiled and synchronized to the admin control panel dashboard.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 text-xs text-neutral-400 font-mono">
                  {/* Category Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">Report Classification</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-emerald-900/5 text-emerald-950 outline-none focus:border-emerald-500/30 transition-all font-mono cursor-pointer"
                    >
                      <option value="bug">🐛 Bug Report</option>
                      <option value="suggestion">💡 Suggestion / Idea</option>
                      <option value="feature">⚡ Feature Request</option>
                      <option value="payment">💳 Payment Problem</option>
                      <option value="website">🌐 General Website Issue</option>
                      <option value="general">💬 General Feedback</option>
                    </select>
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">Problem Description</label>
                    <textarea
                      placeholder="Explain your issue, suggestion, or payment details in detail..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-emerald-900/5 text-emerald-950 outline-none focus:border-emerald-500/30 transition-all font-sans leading-relaxed resize-none text-[12px]"
                      required
                    />
                  </div>

                  {/* Screenshot / File Attachment */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">Screenshot / Image Attachment</label>
                    {screenshotPreview ? (
                      <div className="relative aspect-video rounded-xl border border-emerald-900/10 overflow-hidden group bg-emerald-950/5 flex items-center justify-center">
                        <img src={screenshotPreview} alt="Screenshot Attachment" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={clearScreenshot}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border border-dashed border-emerald-900/10 hover:border-emerald-500/20 bg-emerald-950/5 hover:bg-black/30 rounded-xl p-6 cursor-pointer transition-all">
                        <Upload size={18} className="text-neutral-500 mb-2" />
                        <span className="text-[10px] text-neutral-400">Click to upload screenshot</span>
                        <span className="text-[8px] text-neutral-600 mt-1 uppercase">PNG, JPG, JPEG (Max 5MB)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>

                  {/* Voice Recording Feedback */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">Voice Diagnostic Log</label>
                    <div className="border border-emerald-900/5 bg-emerald-950/5 rounded-xl p-4 flex items-center justify-between gap-4">
                      {isRecording ? (
                        <div className="flex items-center gap-3 w-full">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                          <span className="text-[#10B981] font-bold text-[10px] uppercase">Recording: {formatTime(recordTime)}</span>
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg font-bold text-[9px] uppercase hover:bg-red-600 transition-all cursor-pointer"
                          >
                            <Square size={10} className="fill-white" /> Stop
                          </button>
                        </div>
                      ) : audioUrl ? (
                        <div className="flex flex-col gap-2.5 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                              <CheckCircle2 size={12} /> Audio Memo Prepared
                            </span>
                            <button
                              type="button"
                              onClick={clearAudio}
                              className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                              title="Delete voice record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <audio src={audioUrl} controls className="w-full h-8 opacity-90 custom-audio-player" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[9px] text-neutral-600 uppercase">Record voice explanation</span>
                          <button
                            type="button"
                            onClick={startRecording}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] hover:bg-emerald-500/20 rounded-lg font-bold text-[9px] uppercase transition-all cursor-pointer"
                          >
                            <Mic size={11} /> Start Record
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Buttons */}
            {!success && (
              <div className="p-6 border-t border-emerald-900/5 bg-emerald-950/5 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-emerald-900/5 hover:border-emerald-900/10 text-neutral-400 hover:text-emerald-950 rounded-xl font-bold uppercase transition-all cursor-pointer text-[10px]"
                >
                  Discard
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-extrabold rounded-xl uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Transmit Diagnostics</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
