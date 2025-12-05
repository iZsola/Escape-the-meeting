export interface DialogueOption {
    text: string;
    outcome: 'success' | 'fail' | 'neutral';
    response: string; // What the NPC says after you choose this
    sanityCost?: number;
}

export interface NPCProfile {
    id: string;
    name: string;
    role: string;
    intro: string; // What they say when you bump into them
    color: number;
    options: DialogueOption[];
}

export const NPCS: NPCProfile[] = [
    {
        id: 'gary',
        name: 'Gary',
        role: 'Project Manager',
        intro: "Hey! Just the person I was looking for. Do you have a sec to sync on the Q3 deliverables?",
        color: 0xff0000, // Red
        options: [
            {
                text: "Sure, let's book a room.",
                outcome: 'fail',
                response: "Great! I have 3 hours free right now.",
                sanityCost: 20
            },
            {
                text: "I'm actually on my way to the... bathroom.",
                outcome: 'neutral',
                response: "Oh, TMI. Go ahead.",
                sanityCost: 0
            },
            {
                text: "Is this about the email I just sent? It explains everything.",
                outcome: 'success',
                response: "Oh, I haven't checked my inbox. I'll go look.",
                sanityCost: 0
            }
        ]
    },
    {
        id: 'karen',
        name: 'Karen',
        role: 'HR Rep',
        intro: "Hi there! We noticed you didn't fill out the engagement survey.",
        color: 0xff00ff, // Purple
        options: [
            {
                text: "I love this company! 10/10!",
                outcome: 'success',
                response: "That's the spirit! I'll mark you down.",
                sanityCost: 0
            },
            {
                text: "Can I do it tomorrow?",
                outcome: 'neutral',
                response: "The deadline is in 5 minutes...",
                sanityCost: 5
            },
            {
                text: "Surveys are anonymous, right? Why are you asking me?",
                outcome: 'fail',
                response: "We just want to make sure everyone is... heard. Come to my office.",
                sanityCost: 30
            }
        ]
    },
    {
        id: 'dave',
        name: 'Dave',
        role: 'Junior Dev',
        intro: "Bro, I broke main. I think I deleted the database.",
        color: 0x00ffff, // Cyan
        options: [
            {
                text: "Have you tried turning it off and on again?",
                outcome: 'success',
                response: "Whoa... it worked. You're a genius.",
                sanityCost: 0
            },
            {
                text: "Let me see the logs.",
                outcome: 'fail',
                response: "Here's the 5GB log file...",
                sanityCost: 50
            },
            {
                text: "Ask chatGPT.",
                outcome: 'neutral',
                response: "Good idea.",
                sanityCost: 0
            }
        ]
    }
];

