import type { Campaign, CampaignFormValues } from '@/types';

const STORAGE_KEY = 'crowdit-demo-campaigns';

const demoCampaigns: Campaign[] = [
  {
    id: 1,
    creator: 'GCREATOR4D3MO4DDR355XXXX1111111111111111111111111111111',
    title: 'Indie Tour Bus Fund',
    description:
      'Help us cover fuel, crew pay, and a tiny mountain of drum hardware as we take our next tour across India and Southeast Asia.',
    goal: 1400,
    raised: 965,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
    claimed: false,
    backers: [
      {
        address: 'GBACKER11111111111111111111111111111111111111111111111',
        amount: 250,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        address: 'GBACKER22222222222222222222222222222222222222222222222',
        amount: 125,
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: 2,
    creator: 'GCREATORSECONDD3MO4DDR355XXXX111111111111111111111111111',
    title: 'Community Vinyl Pressing',
    description:
      'A limited-run vinyl pressing for our live sessions series, produced with local designers and pressing partners.',
    goal: 2200,
    raised: 2200,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
    claimed: false,
    backers: [
      {
        address: 'GBACKER33333333333333333333333333333333333333333333333',
        amount: 400,
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ],
  },
  {
    id: 3,
    creator: 'GCREATORTHIRDD3MO4DDR355XXXX1111111111111111111111111111',
    title: 'Youth Studio Scholarship',
    description:
      'We are opening five free recording sessions for first-time artists and covering engineering, transport, and release art.',
    goal: 1800,
    raised: 520,
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    claimed: false,
    backers: [
      {
        address: 'GBACKER44444444444444444444444444444444444444444444444',
        amount: 80,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ],
  },
];

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readCampaigns(): Campaign[] {
  if (!canUseStorage()) {
    return demoCampaigns;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCampaigns));
    return demoCampaigns;
  }

  try {
    return JSON.parse(stored) as Campaign[];
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCampaigns));
    return demoCampaigns;
  }
}

function writeCampaigns(campaigns: Campaign[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export function createDemoCampaign(
  values: CampaignFormValues,
  creator: string,
): Campaign {
  const campaigns = readCampaigns();
  const nextId = campaigns.length === 0 ? 1 : Math.max(...campaigns.map((item) => item.id)) + 1;
  const campaign: Campaign = {
    id: nextId,
    creator,
    title: values.title,
    description: values.description,
    goal: values.goal,
    raised: 0,
    deadline: values.deadline,
    claimed: false,
    backers: [],
  };

  const nextCampaigns = [campaign, ...campaigns];
  writeCampaigns(nextCampaigns);
  return campaign;
}

export function backDemoCampaign(
  campaignId: number,
  address: string,
  amount: number,
): Campaign {
  const campaigns = readCampaigns();
  const updated = campaigns.map((campaign) => {
    if (campaign.id !== campaignId) {
      return campaign;
    }

    return {
      ...campaign,
      raised: campaign.raised + amount,
      backers: [
        {
          address,
          amount,
          timestamp: new Date().toISOString(),
        },
        ...campaign.backers,
      ],
    };
  });

  writeCampaigns(updated);
  const match = updated.find((item) => item.id === campaignId);

  if (!match) {
    throw new Error('Campaign not found');
  }

  return match;
}

export function claimDemoCampaign(campaignId: number): Campaign {
  const campaigns = readCampaigns();
  const updated = campaigns.map((campaign) => {
    if (campaign.id !== campaignId) {
      return campaign;
    }

    return {
      ...campaign,
      claimed: true,
    };
  });

  writeCampaigns(updated);
  const match = updated.find((item) => item.id === campaignId);

  if (!match) {
    throw new Error('Campaign not found');
  }

  return match;
}

export function refundDemoCampaign(campaignId: number, address: string): Campaign {
  const campaigns = readCampaigns();
  const updated = campaigns.map((campaign) => {
    if (campaign.id !== campaignId) {
      return campaign;
    }

    const refundedAmount = campaign.backers.reduce((sum, backer) => {
      return backer.address === address ? sum + backer.amount : sum;
    }, 0);

    return {
      ...campaign,
      raised: Math.max(0, campaign.raised - refundedAmount),
      backers: campaign.backers.filter((backer) => backer.address !== address),
    };
  });

  writeCampaigns(updated);
  const match = updated.find((item) => item.id === campaignId);

  if (!match) {
    throw new Error('Campaign not found');
  }

  return match;
}
