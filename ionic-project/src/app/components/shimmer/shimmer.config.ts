// Shimmer Configuration Types
export interface ShimmerLineConfig {
  height: number;
  width: string;
  marginBottom: number;
}

export interface ShimmerButtonConfig {
  height: number;
  width: string;
  position?: 'left' | 'right' | 'center';
  marginTop?: number;
}

export interface ShimmerCardConfig {
  width: string;
  height?: string;
  padding: number;
  borderRadius: number;
  lines: ShimmerLineConfig[];
  buttons?: ShimmerButtonConfig[];
  imageHeight?: number;
  imageWidth?: string;
  gap?: number;
}

export interface ShimmerGridConfig {
  columns: string;
  gap: number;
  layout: 'grid' | 'flex' | 'horizontal';
  direction?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
}

export interface ShimmerDeviceConfig {
  container: {
    height?: string;
    width?: string;
    padding?: number;
  };
  grid: ShimmerGridConfig;
  card: ShimmerCardConfig;
}

export interface ShimmerModeConfig {
  desktop: ShimmerDeviceConfig;
  tablet: ShimmerDeviceConfig;
  mobile: ShimmerDeviceConfig;
}

export interface ShimmerConfig {
  [mode: string]: {
    [type: string]: ShimmerModeConfig;
  };
}

// Main Shimmer Configuration
export const SHIMMER_CONFIG: ShimmerConfig = {
  home: {
    banner: {
      desktop: {
        container: {
          height: '400px',
          padding: 60
        },
        grid: {
          columns: '1fr 1fr',
          gap: 40,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 0,
          borderRadius: 0,
          lines: [
            { height: 48, width: '80%', marginBottom: 20 },
            { height: 48, width: '90%', marginBottom: 20 },
            { height: 24, width: '70%', marginBottom: 20 }
          ],
          buttons: [
            { height: 48, width: '150px', position: 'left', marginTop: 20 }
          ],
          imageHeight: 300,
          imageWidth: '100%'
        }
      },
      tablet: {
        container: {
          height: '350px',
          padding: 40
        },
        grid: {
          columns: '1fr',
          gap: 30,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 0,
          borderRadius: 0,
          lines: [
            { height: 36, width: '90%', marginBottom: 15 },
            { height: 36, width: '95%', marginBottom: 15 },
            { height: 20, width: '80%', marginBottom: 15 }
          ],
          buttons: [
            { height: 44, width: '130px', position: 'left', marginTop: 15 }
          ],
          imageHeight: 250,
          imageWidth: '100%'
        }
      },
      mobile: {
        container: {
          height: '300px',
          padding: 30
        },
        grid: {
          columns: '1fr',
          gap: 20,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 0,
          borderRadius: 0,
          lines: [
            { height: 28, width: '95%', marginBottom: 12 },
            { height: 28, width: '100%', marginBottom: 12 },
            { height: 18, width: '85%', marginBottom: 12 }
          ],
          buttons: [
            { height: 40, width: '120px', position: 'left', marginTop: 12 }
          ],
          imageHeight: 200,
          imageWidth: '100%'
        }
      }
    },
    product: {
      desktop: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 20,
          layout: 'grid'
        },
        card: {
          width: '100%',
          height: 'auto',
          padding: 15,
          borderRadius: 8,
          imageHeight: 250,
          imageWidth: '100%',
          lines: [
            { height: 20, width: '100%', marginBottom: 10 },
            { height: 16, width: '70%', marginBottom: 12 }
          ],
          buttons: [
            { height: 40, width: '100%', position: 'left', marginTop: 15 },
            { height: 40, width: '40px', position: 'right', marginTop: 0 }
          ],
          gap: 10
        }
      },
      tablet: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(2, 1fr)',
          gap: 12,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 10,
          borderRadius: 6,
          imageHeight: 180,
          imageWidth: '100%',
          lines: [
            { height: 16, width: '100%', marginBottom: 8 },
            { height: 14, width: '70%', marginBottom: 10 }
          ],
          buttons: [
            { height: 36, width: '100%', position: 'left', marginTop: 12 },
            { height: 36, width: '36px', position: 'right', marginTop: 0 }
          ]
        }
      },
      mobile: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(2, 1fr)',
          gap: 10,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 10,
          borderRadius: 6,
          imageHeight: 150,
          imageWidth: '100%',
          lines: [
            { height: 14, width: '100%', marginBottom: 6 },
            { height: 12, width: '70%', marginBottom: 8 }
          ],
          buttons: [
            { height: 32, width: '100%', position: 'left', marginTop: 10 },
            { height: 32, width: '32px', position: 'right', marginTop: 0 }
          ]
        }
      }
    },
    brand: {
      desktop: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 20,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 20,
          borderRadius: 8,
          imageHeight: 100,
          imageWidth: '100px',
          lines: [
            { height: 16, width: '80%', marginBottom: 0 }
          ],
          gap: 12
        }
      },
      tablet: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(3, 1fr)',
          gap: 15,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 15,
          borderRadius: 6,
          imageHeight: 80,
          imageWidth: '80px',
          lines: [
            { height: 14, width: '80%', marginBottom: 0 }
          ],
          gap: 10
        }
      },
      mobile: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(2, 1fr)',
          gap: 12,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 12,
          borderRadius: 6,
          imageHeight: 60,
          imageWidth: '60px',
          lines: [
            { height: 12, width: '80%', marginBottom: 0 }
          ],
          gap: 8
        }
      }
    },
    category: {
      desktop: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 15,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 15,
          borderRadius: 8,
          imageHeight: 60,
          imageWidth: '60px',
          lines: [
            { height: 14, width: '90%', marginBottom: 0 }
          ],
          gap: 10
        }
      },
      tablet: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(4, 1fr)',
          gap: 12,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 12,
          borderRadius: 6,
          imageHeight: 50,
          imageWidth: '50px',
          lines: [
            { height: 12, width: '90%', marginBottom: 0 }
          ],
          gap: 8
        }
      },
      mobile: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(3, 1fr)',
          gap: 10,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 10,
          borderRadius: 6,
          imageHeight: 40,
          imageWidth: '40px',
          lines: [
            { height: 10, width: '90%', marginBottom: 0 }
          ],
          gap: 6
        }
      }
    }
  },
  products: {
    product: {
      desktop: {
        container: {
          padding: 20
        },
        grid: {
          columns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 20,
          borderRadius: 10,
          imageHeight: 280,
          imageWidth: '100%',
          lines: [
            { height: 22, width: '100%', marginBottom: 10 },
            { height: 18, width: '75%', marginBottom: 8 },
            { height: 16, width: '60%', marginBottom: 12 }
          ],
          buttons: [
            { height: 44, width: '100%', position: 'left', marginTop: 16 }
          ],
          gap: 12
        }
      },
      tablet: {
        container: {
          padding: 15
        },
        grid: {
          columns: 'repeat(3, 1fr)',
          gap: 16,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 15,
          borderRadius: 8,
          imageHeight: 200,
          imageWidth: '100%',
          lines: [
            { height: 18, width: '100%', marginBottom: 8 },
            { height: 16, width: '75%', marginBottom: 6 }
          ],
          buttons: [
            { height: 38, width: '100%', position: 'left', marginTop: 12 }
          ]
        }
      },
      mobile: {
        container: {
          padding: 10
        },
        grid: {
          columns: 'repeat(2, 1fr)',
          gap: 12,
          layout: 'grid'
        },
        card: {
          width: '100%',
          padding: 12,
          borderRadius: 6,
          imageHeight: 160,
          imageWidth: '100%',
          lines: [
            { height: 16, width: '100%', marginBottom: 6 },
            { height: 14, width: '70%', marginBottom: 6 }
          ],
          buttons: [
            { height: 34, width: '100%', position: 'left', marginTop: 10 }
          ]
        }
      }
    }
  },
  cart: {
    product: {
      desktop: {
        container: {
          padding: 20
        },
        grid: {
          columns: '1fr',
          gap: 16,
          layout: 'flex',
          direction: 'column'
        },
        card: {
          width: '100%',
          padding: 20,
          borderRadius: 8,
          imageHeight: 120,
          imageWidth: '120px',
          lines: [
            { height: 20, width: '300px', marginBottom: 8 },
            { height: 16, width: '200px', marginBottom: 8 },
            { height: 24, width: '150px', marginBottom: 0 }
          ],
          buttons: [
            { height: 36, width: '100px', position: 'right', marginTop: 0 }
          ],
          gap: 20
        }
      },
      tablet: {
        container: {
          padding: 15
        },
        grid: {
          columns: '1fr',
          gap: 12,
          layout: 'flex',
          direction: 'column'
        },
        card: {
          width: '100%',
          padding: 15,
          borderRadius: 6,
          imageHeight: 100,
          imageWidth: '100px',
          lines: [
            { height: 18, width: '250px', marginBottom: 6 },
            { height: 14, width: '180px', marginBottom: 6 }
          ],
          buttons: [
            { height: 32, width: '80px', position: 'right', marginTop: 0 }
          ]
        }
      },
      mobile: {
        container: {
          padding: 10
        },
        grid: {
          columns: '1fr',
          gap: 10,
          layout: 'flex',
          direction: 'column'
        },
        card: {
          width: '100%',
          padding: 12,
          borderRadius: 6,
          imageHeight: 80,
          imageWidth: '80px',
          lines: [
            { height: 16, width: '100%', marginBottom: 6 },
            { height: 14, width: '80%', marginBottom: 6 }
          ],
          buttons: [
            { height: 30, width: '70px', position: 'right', marginTop: 0 }
          ]
        }
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Table Shimmer Configuration (used by shimmer-table component)
// ─────────────────────────────────────────────────────────────────────────────

export type TableColumnType =
  | 'text'
  | 'text-wide'
  | 'image-text'
  | 'avatar-text'
  | 'badge'
  | 'actions'
  | 'currency'
  | 'date'
  | 'number';

export interface TableShimmerColumn {
  type: TableColumnType;
  mobileHide?: boolean;
}

export interface TableShimmerPageConfig {
  columns: TableShimmerColumn[];
  filters: number; // how many filter selects after the search box
  rows?: number;   // default rows to render
}

export const TABLE_SHIMMER_CONFIGS: Record<string, TableShimmerPageConfig> = {
  brands: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'date',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  category: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'image-text' },
      { type: 'text',     mobileHide: true },
      { type: 'date',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  'sub-category': {
    filters: 2,
    rows: 8,
    columns: [
      { type: 'image-text' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'date',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  stores: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  customers: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text',       mobileHide: true },
      { type: 'avatar-text' },
      { type: 'text',       mobileHide: true },
      { type: 'text',       mobileHide: true },
      { type: 'text',       mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  sales: {
    filters: 2,
    rows: 8,
    columns: [
      { type: 'date' },
      { type: 'text' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'currency', mobileHide: true },
      { type: 'currency', mobileHide: true },
      { type: 'currency', mobileHide: true },
      { type: 'badge' },
    ],
  },
  purchases: {
    filters: 3,
    rows: 8,
    columns: [
      { type: 'date' },
      { type: 'text' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'currency', mobileHide: true },
      { type: 'currency', mobileHide: true },
      { type: 'currency', mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  warehouses: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text-wide' },
      { type: 'avatar-text', mobileHide: true },
      { type: 'text',        mobileHide: true },
      { type: 'number',      mobileHide: true },
      { type: 'number',      mobileHide: true },
      { type: 'number',      mobileHide: true },
      { type: 'date',        mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  products: {
    filters: 2,
    rows: 8,
    columns: [
      { type: 'text',       mobileHide: true },
      { type: 'image-text' },
      { type: 'text',       mobileHide: true },
      { type: 'text',       mobileHide: true },
      { type: 'currency',   mobileHide: true },
      { type: 'text',       mobileHide: true },
      { type: 'number',     mobileHide: true },
      { type: 'actions' },
    ],
  },
  'low-stocks': {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'image-text' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'number',   mobileHide: true },
      { type: 'number' },
      { type: 'badge' },
    ],
  },
  'expired-products': {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'image-text' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'date',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  suppliers: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  units: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  billers: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  'manage-stock': {
    filters: 2,
    rows: 8,
    columns: [
      { type: 'text',     mobileHide: true },
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'number',   mobileHide: true },
      { type: 'number',   mobileHide: true },
      { type: 'badge' },
    ],
  },
  'stock-adjustment': {
    filters: 2,
    rows: 8,
    columns: [
      { type: 'date',     mobileHide: true },
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'number',   mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'text',     mobileHide: true },
    ],
  },
  'stock-transfer': {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'date',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'number',   mobileHide: true },
      { type: 'currency', mobileHide: true },
      { type: 'badge' },
      { type: 'text',     mobileHide: true },
    ],
  },
  'purchase-orders': {
    filters: 2,
    rows: 8,
    columns: [
      { type: 'date' },
      { type: 'text' },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'currency', mobileHide: true },
      { type: 'currency', mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  invoices: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'date' },
      { type: 'text' },
      { type: 'avatar-text', mobileHide: true },
      { type: 'currency',    mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
  default: {
    filters: 1,
    rows: 8,
    columns: [
      { type: 'text-wide' },
      { type: 'text',     mobileHide: true },
      { type: 'text',     mobileHide: true },
      { type: 'badge' },
      { type: 'actions' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper function to get config
export function getShimmerConfig(
  mode: string,
  type: string,
  device: 'desktop' | 'tablet' | 'mobile'
): ShimmerDeviceConfig {
  return SHIMMER_CONFIG[mode]?.[type]?.[device] || SHIMMER_CONFIG['home']['product'][device];
}

// Helper function to detect device
export function detectDevice(): 'desktop' | 'tablet' | 'mobile' {
  const width = window.innerWidth;
  if (width < 480) return 'mobile';
  if (width < 768) return 'tablet';
  return 'desktop';
}
