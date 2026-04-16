import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface WhoAreYouDialogProps {
  participants: string[];
  open: boolean;
  onSelect: (name: string) => void;
}

export function WhoAreYouDialog({ participants, open, onSelect }: WhoAreYouDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Who are you?</DialogTitle>
          <DialogDescription>
            Select your name to properly format the chat bubbles (your messages will appear in green on the right).
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {participants.map((p) => (
            <Button
              key={p}
              variant="outline"
              className="w-full justify-start text-left truncate overflow-hidden"
              onClick={() => onSelect(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
