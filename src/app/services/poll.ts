export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  created: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Vote {
  pollId: string;
  optionId: string;
  timestamp: Date;
}
