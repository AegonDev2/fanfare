import { Loader } from "@/components/ui/loader";

export function TutorialLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <Loader size="lg" className="mb-6" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-display font-semibold text-foreground">
          Preparing Your Tutorial
        </h2>
        <p className="text-muted-foreground">
          Loading amazing features while we set things up...
        </p>
      </div>
    </div>
  );
}