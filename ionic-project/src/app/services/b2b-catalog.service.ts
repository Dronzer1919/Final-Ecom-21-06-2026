import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

// --- Interfaces ----------------------------------------------------------------

export interface B2BSubcategory {
  id: string;
  subcategoryId?: string;
  name: string;
  icon: string;
  categoryId: string;
  productIds: string[];
}

export interface B2BCategory {
  id: string;
  categoryId?: string;
  name: string;
  description: string;
  icon: string;
  sectionId: string;
  subcategories: B2BSubcategory[];
}

export interface B2BSection {
  id: string;
  sectionId?: string;
  name: string;
  icon: string;
  description: string;
  categoryIds: string[];
}

export interface B2BCatalogProduct {
  productId: string;
  productName: string;
  category: string;
  categoryId: string;
  subcategoryId: string;
  image: string;
  vendorCount: number;
  priceRange: { min: number; max: number };
  unit: string;
  fromBulkUpload?: boolean;
}

// --- Service -------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class B2BCatalogService {
  private _sections:   B2BSection[]        = [];
  private _categories: B2BCategory[]       = [];
  private _products:   B2BCatalogProduct[] = [];

  /** Emits true once the catalog is loaded from the API. */
  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this._loadCatalog();
  }

  // -- Bootstrap: fetch from real APIs -----------------------------------------

  private _loadCatalog(): void {
    this._loadCatalogAsync();
  }

  private async _loadCatalogAsync(): Promise<void> {
    try {
      // ── Step 1: Fetch main categories ─────────────────────────────────────
      const catRes = await lastValueFrom(
        this.http.get<any>(`${environment.apiUrl}/categories?limit=100`)
      );
      const categories: any[] = catRes?.data?.categories ?? [];
      console.log(`[B2BCatalog] Step 1 — ${categories.length} categories loaded`);

      this._sections = categories.map(cat => ({
        id:          cat._id,
        sectionId:   cat._id,
        name:        cat.name,
        icon:        cat.icon ?? '🛒',
        description: cat.description ?? '',
        categoryIds: []
      }));

      if (categories.length === 0) {
        this.loaded$.next(true);
        return;
      }

      // ── Step 2: Fetch subcategories for each main category (parallel) ──────
      const subResults = await Promise.all(
        categories.map(async cat => {
          try {
            const res = await lastValueFrom(
              this.http.get<any>(`${environment.apiUrl}/subcategories?category=${cat._id}&limit=100`)
            );
            const all = res?.data?.subcategories ?? [];
            const topLevel = all.filter((s: any) => !s.parentSubcategory);
            console.log(`[B2BCatalog] Step 2 — "${cat.name}": ${topLevel.length} subcategories`);
            return { catId: cat._id as string, subcategories: topLevel };
          } catch (e) {
            console.error(`[B2BCatalog] Step 2 failed for category ${cat._id}:`, e);
            return { catId: cat._id as string, subcategories: [] as any[] };
          }
        })
      );

      this._categories = [];
      const subcategoryIds: string[] = [];

      for (const { catId, subcategories } of subResults) {
        const section = this._sections.find(s => s.id === catId);
        const b2bCats: B2BCategory[] = subcategories.map((sub: any) => ({
          id:            sub._id,
          categoryId:    sub._id,
          name:          sub.name,
          description:   sub.description ?? '',
          icon:          sub.icon ?? '📁',
          sectionId:     catId,
          subcategories: []
        }));
        this._categories.push(...b2bCats);
        if (section) section.categoryIds = b2bCats.map(c => c.id);
        subcategoryIds.push(...subcategories.map((s: any) => s._id as string));
      }

      // ── Step 3: Fetch sub-sub-categories for each subcategory (parallel) ───
      // Uses the dedicated /sub-sub-categories endpoint (not /subcategories)
      if (subcategoryIds.length > 0) {
        const sscResults = await Promise.all(
          subcategoryIds.map(async subId => {
            try {
              const res = await lastValueFrom(
                this.http.get<any>(`${environment.apiUrl}/sub-sub-categories?parentSubcategory=${subId}&limit=100`)
              );
              const items = res?.data?.subcategories ?? [];
              console.log(`[B2BCatalog] Step 3 — subcat ${subId}: ${items.length} sub-sub-categories`);
              return { parentId: subId, items };
            } catch (e) {
              console.error(`[B2BCatalog] Step 3 failed for subcategory ${subId}:`, e);
              return { parentId: subId, items: [] as any[] };
            }
          })
        );

        for (const { parentId, items } of sscResults) {
          const cat = this._categories.find(c => c.id === parentId);
          if (cat) {
            cat.subcategories = items.map((ssc: any) => ({
              id:            ssc._id,
              subcategoryId: ssc._id,
              name:          ssc.name,
              icon:          ssc.icon ?? '🗂️',
              categoryId:    parentId,
              productIds:    []
            }));
          }
        }
      }

      // ── Step 4: Fetch all B2B products ────────────────────────────────────
      try {
        const prodRes = await lastValueFrom(
          this.http.get<any>(`${environment.apiUrl}/products?isB2B=true&limit=200`)
        );
        const prods: any[] = prodRes?.data ?? [];
        console.log(`[B2BCatalog] Step 4 — ${prods.length} B2B products loaded`);

        this._products = prods.map(p => ({
          productId:    p._id,
          productName:  p.name ?? p.productName ?? '',
          category:     typeof p.category === 'object' ? p.category?.name ?? '' : '',
          categoryId:   typeof p.category === 'object' ? p.category?._id ?? '' : p.category ?? '',
          subcategoryId:typeof p.subCategory === 'object' ? p.subCategory?._id ?? '' : p.subCategory ?? '',
          image:        p.images?.[0] ?? '',
          vendorCount:  p.vendorCount ?? 1,
          priceRange:   { min: p.price ?? 0, max: p.price ?? 0 },
          unit:         typeof p.unit === 'object'
                          ? (p.unit?.shortName ?? p.unit?.name ?? 'Pcs')
                          : (p.unit ?? 'Pcs')
        }));

        for (const prod of this._products) {
          for (const cat of this._categories) {
            const sub = cat.subcategories.find(s => s.id === prod.subcategoryId);
            if (sub && !sub.productIds.includes(prod.productId)) {
              sub.productIds.push(prod.productId);
            }
          }
        }
      } catch (e) {
        console.warn('[B2BCatalog] Step 4 — products load failed (non-fatal):', e);
      }

      this.loaded$.next(true);
    } catch (err) {
      console.error('[B2BCatalog] Fatal error loading catalog:', err);
      this.loaded$.next(true);
    }
  }

  // -- Public read-only API (same shape as before) ------------------------------

  get sections():   B2BSection[]        { return this._sections;   }
  get categories(): B2BCategory[]       { return this._categories; }
  get products():   B2BCatalogProduct[] { return this._products;   }

  getSectionById(id: string): B2BSection | undefined {
    return this._sections.find(s => s.id === id);
  }

  getCategoryById(id: string): B2BCategory | undefined {
    return this._categories.find(c => c.id === id);
  }

  getCategoriesForSection(sectionId: string): B2BCategory[] {
    const section = this._sections.find(s => s.id === sectionId);
    if (!section) return [];
    return this._categories.filter(c => section.categoryIds.includes(c.id));
  }

  getSubcategoryById(categoryId: string, subcategoryId: string): B2BSubcategory | undefined {
    return this.getCategoryById(categoryId)?.subcategories.find(s => s.id === subcategoryId);
  }

  getProductsBySubcategory(subcategoryId: string): B2BCatalogProduct[] {
    return this._products.filter(p => p.subcategoryId === subcategoryId);
  }

  getProductsByCategory(categoryId: string): B2BCatalogProduct[] {
    return this._products.filter(p => p.categoryId === categoryId);
  }

  getProductCountForCategory(categoryId: string): number {
    const cat = this.getCategoryById(categoryId);
    if (!cat) return 0;
    return cat.subcategories.reduce(
      (total, sub) => total + this.getProductsBySubcategory(sub.id).length, 0
    );
  }

  getProductCountForSubcategory(subcategoryId: string): number {
    return this.getProductsBySubcategory(subcategoryId).length;
  }

  // -- Bulk upload helper -------------------------------------------------------

  addBulkB2BProducts(rows: BulkB2BRow[]): void {
    for (const row of rows) {
      if (!row.isB2B || row.isB2B.toLowerCase() !== 'yes') continue;

      const categoryId    = this._resolveCategoryId(row.category);
      const subcategoryId = this._resolveSubcategoryId(categoryId, row.subCategory);

      if (this._products.some(p => p.productId === row.itemCode)) continue;

      const product: B2BCatalogProduct = {
        productId:    row.itemCode || `BULK-${Date.now()}`,
        productName:  row.productName,
        category:     row.category,
        categoryId,
        subcategoryId,
        image:        '',
        vendorCount:  1,
        priceRange:   { min: Number(row.price) || 0, max: Number(row.price) || 0 },
        unit:         row.unit || 'Pcs',
        fromBulkUpload: true
      };

      this._products = [...this._products, product];

      const cat = this._categories.find(c => c.id === categoryId);
      if (cat) {
        const sub = cat.subcategories.find(s => s.id === subcategoryId);
        if (sub && !sub.productIds.includes(product.productId)) {
          sub.productIds.push(product.productId);
        }
      }
    }
  }

  // -- Private helpers ----------------------------------------------------------

  private _resolveCategoryId(categoryName: string): string {
    if (!categoryName) return this._sections[0]?.id ?? '';
    const name = categoryName.toLowerCase().trim();
    const match = this._sections.find(s => s.name.toLowerCase().includes(name) || name.includes(s.name.toLowerCase()));
    return match?.id ?? this._sections[0]?.id ?? '';
  }

  private _resolveSubcategoryId(categoryId: string, subCategoryName: string): string {
    if (!subCategoryName) return '';
    const cat  = this._categories.find(c => c.id === categoryId);
    if (!cat) return '';
    const name  = subCategoryName.toLowerCase().trim();
    const match = cat.subcategories.find(
      s => s.name.toLowerCase().includes(name) || name.includes(s.name.toLowerCase())
    );
    return match?.id ?? '';
  }
}

/** Minimal shape from BulkProductRow used here */
export interface BulkB2BRow {
  isB2B: string;
  itemCode: string;
  productName: string;
  category: string;
  subCategory: string;
  price: string | number;
  unit: string;
}
