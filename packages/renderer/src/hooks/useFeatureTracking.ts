import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { logFeatureUsage } from '@/lib/store/slices/statsSlice';
import { recordAppVisit, trackFeatureUsage as trackUsage } from '@/services/database';

// Use a session storage flag to track if we've already recorded a visit for this session
const APP_VISIT_RECORDED_KEY = 'app_visit_recorded';

/**
 * Hook to track feature usage with time spent
 * @param feature - Feature identifier (e.g., 'json_formatter', 'json_compare')
 * @returns void
 */
export const useFeatureTracking = (feature: string) => {
  const dispatch = useAppDispatch();
  const startTimeRef = useRef<number>(Date.now());
  
  // Record visit on page load
  useEffect(() => {
    // Check if we've already recorded an app visit for this session
    const hasRecordedVisit = sessionStorage.getItem(APP_VISIT_RECORDED_KEY);
    
    // Only record an app visit if this is the first page visited in the session
    if (!hasRecordedVisit) {
      recordAppVisit();
      // Mark that we've recorded a visit for this session
      sessionStorage.setItem(APP_VISIT_RECORDED_KEY, 'true');
    }
    
    // Immediately record a feature visit with 0 time spent (will update on unmount)
    dispatch(logFeatureUsage({ feature, timeSpent: 0 }));
    
    // Reset start time
    startTimeRef.current = Date.now();
    
    // On unmount, calculate and record time spent
    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      dispatch(logFeatureUsage({ feature, timeSpent }));
    };
  }, [feature, dispatch]);
};

/**
 * Hook to track feature usage without time tracking
 * @returns Object with trackFeatureUsage function
 */
export function useSimpleFeatureTracking() {
  const trackFeatureUsage = useCallback((featureName: string) => {
    try {
      trackUsage(featureName).catch((err: any) => {
        console.error(`Error tracking feature usage for ${featureName}:`, err);
      });
    } catch (error) {
      console.error(`Unexpected error tracking feature ${featureName}:`, error);
    }
  }, []);

  return { trackFeatureUsage };
} 