import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star,  MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import api from '../../services/api';

export default function SessionReview() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const durationCompleted = parseInt(searchParams.get('duration') || '0');

  // Mark the session completed so credits settle. Used by both submit and skip.
  const completeSession = async () => {
    await api.put(`/sessions/${sessionId}`, {
      status: 'COMPLETED',
      actualDuration: durationCompleted
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
        toast.error("Please select a rating");
        return;
    }

    setLoading(true);
    try {
        await completeSession();

        // Submit the review to the review endpoint
        if (rating > 0) {
            await api.post(`/sessions/${sessionId}/review`, { rating, comment });
        }

        toast.success("Session completed and review submitted!");
        navigate('/dashboard/credits');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await completeSession();
      toast.success("Session completed!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
       <motion.div
         initial={{ opacity: 0, scale: 0.97 }}
         animate={{ opacity: 1, scale: 1 }}
         className="max-w-md w-full bg-card border border-border rounded-2xl p-8"
       >
            <div className="flex justify-center mb-6">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-accent" />
                </div>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-center mb-2">Session completed</h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
                How was your experience? Your feedback helps the community grow.
            </p>

            <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-8 h-8 ${(hoveredRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/40'}`}
                        />
                    </button>
                ))}
            </div>

            <div className="space-y-4 mb-8">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Additional feedback
                </label>
                <Textarea
                    placeholder="Share details about your session..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                />
            </div>

            <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
            >
                {loading ? 'Submitting...' : 'Submit review'}
            </Button>

            <button
                onClick={handleSkip}
                disabled={loading}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                Skip feedback
            </button>
       </motion.div>
    </div>
  );
}
