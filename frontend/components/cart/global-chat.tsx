import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A subtle, fixed chat bubble for real-time support.
 * This component is intended to be positioned globally via a layout wrapper.
 */
export function GlobalChatBubble() {
  const handleChatClick = () => {
    // In a real application, this would open a zendesk/intercom/crisp widget
    console.log("Chat widget opened for expert support.");
    alert(
      "Chat with an Expert: How can we help you today? (This is a mock chat launch)"
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleChatClick}
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200"
        aria-label="Chat with an Expert"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      {/* Optional: Add a subtle text label next to the bubble on desktop */}
      {/* <div className="absolute right-16 top-1/2 transform -translate-y-1/2 hidden md:block text-sm font-light text-black dark:text-white bg-white dark:bg-black px-3 py-1 rounded-full shadow-md">
        Chat with an Expert
      </div> */}
    </div>
  );
}
