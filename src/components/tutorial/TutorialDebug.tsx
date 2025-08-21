import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTutorial } from '@/hooks/useTutorial';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';

export function TutorialDebug() {
  const { resetTutorial } = useTutorial();
  const { resetFirstTimeUser } = useFirstTimeUser();

  const handleReset = () => {
    resetTutorial();
    resetFirstTimeUser();
    window.location.reload();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 z-50 bg-card/90 backdrop-blur-sm">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Tutorial Debug</h3>
        <Button
          onClick={handleReset}
          size="sm"
          variant="outline"
          className="w-full text-xs"
        >
          Reset Tutorial
        </Button>
      </div>
    </Card>
  );
}