"use client"

import { GmailMessage } from '@/lib/gmail-service';
import { Mail, Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GmailMessageCardProps {
  message: GmailMessage;
  onClick?: () => void;
}

export function GmailMessageCard({ message, onClick }: GmailMessageCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const extractSenderName = (from: string) => {
    const match = from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return match[1].trim();
    }
    return from;
  };

  const extractSenderEmail = (from: string) => {
    const match = from.match(/<(.+)>$/);
    if (match) {
      return match[1];
    }
    return from;
  };

  return (
    <Card 
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {extractSenderName(message.from)}
            </h3>
            <Badge variant="outline" className="text-xs">
              {formatDate(message.date)}
            </Badge>
          </div>
          
          <p className="text-sm font-medium text-foreground mb-1 truncate">
            {message.subject || 'No Subject'}
          </p>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {message.snippet || message.textBody?.substring(0, 100) || 'No preview available'}
          </p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[200px]">
                {extractSenderEmail(message.from)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(message.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
