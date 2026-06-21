import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryService, Category } from './category.service';
import { SubcategoryService, Subcategory } from './subcategory.service';
import { ProductService, Product } from './product.service';
import { SupplierService, Supplier } from './supplier.service';

// ─── B2B Vendor (extends Supplier) ──────────────────────────────────────────

export interface BulkPricingTier {
  quantity: number;
  unit: string;
  price: number;
  discount: number;
}

export interface B2BVendor extends Supplier {
  rating?: number;
  reviewCount?: number;
  responseRate?: number;
  hasGST?: boolean;
  gstNumber?: string;
  location?: string;
  locality?: string;
  memberSince?: string;
  productIds?: string[];
  bulkPricing?: BulkPricingTier[];
  isB2BVendor?: boolean;
  minOrderQty?: number;
  variety?: string;
}

export interface B2BVendorResponse {
  success: boolean;
  message: string;
  data: {
    vendors: B2BVendor[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// ─── B2B Product (extends Product with B2B fields) ─────────────────────────

export interface B2BProduct extends Product {
  isB2B?: boolean;
  variety?: string;
  minOrderQuantity?: number;
  supplierLocation?: string;
  responseRate?: number;
  hasGST?: boolean;
  bulkPricing?: BulkPricingTier[];
  vendorCount?: number;
  priceRange?: { min: number; max: number };
}

// ─── Sub-Sub Category (subcategory with a parent subcategory) ────────────────

export interface B2BSubSubCategory extends Subcategory {
  parentSubcategory?: string | { _id: string; name: string };
}

// ─── Step Form Data (5 steps) ────────────────────────────────────────────────

export interface B2BStepFormData {
  step1_category: Partial<Category> & { icon?: string };
  step2_subcategory: Partial<Subcategory> & { icon?: string };
  step3_subSubCategory: Partial<B2BSubSubCategory> & { icon?: string };
  step4_product: Partial<B2BProduct>;
  step5_vendor: Partial<B2BVendor>;
}

// ─── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class B2BManagementService {
  private vendorApiUrl = `${environment.apiUrl}/suppliers`;

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private productService: ProductService,
    private supplierService: SupplierService
  ) {}

  // ── Categories ─────────────────────────────────────────────────────────────

  getCategories(page = 1, limit = 20, search?: string): Observable<any> {
    return this.categoryService.getAllCategories(page, limit, search, true);
  }

  createCategory(data: Partial<Category> & { icon?: string }): Observable<any> {
    return this.categoryService.createCategory(data as Category);
  }

  updateCategory(id: string, data: Partial<Category> & { icon?: string }): Observable<any> {
    return this.categoryService.updateCategory(id, data);
  }

  deleteCategory(id: string): Observable<any> {
    return this.categoryService.deleteCategory(id);
  }

  getCategoryById(id: string): Observable<any> {
    return this.categoryService.getCategoryById(id);
  }

  // ── Subcategories ──────────────────────────────────────────────────────────

  getSubcategories(page = 1, limit = 20, search?: string, categoryId?: string): Observable<any> {
    return this.subcategoryService.getAllSubcategories(page, limit, search, categoryId, true);
  }

  createSubcategory(data: Partial<Subcategory> & { icon?: string }): Observable<any> {
    return this.subcategoryService.createSubcategory(data as Subcategory);
  }

  updateSubcategory(id: string, data: Partial<Subcategory> & { icon?: string }): Observable<any> {
    return this.subcategoryService.updateSubcategory(id, data);
  }

  deleteSubcategory(id: string): Observable<any> {
    return this.subcategoryService.deleteSubcategory(id);
  }

  getSubcategoryById(id: string): Observable<any> {
    return this.subcategoryService.getSubcategoryById(id);
  }

  // ── Sub-Sub Categories ─────────────────────────────────────────────────────

  getSubSubCategories(page = 1, limit = 100, parentSubcategoryId?: string): Observable<any> {
    return this.subcategoryService.getAllSubcategories(page, limit, undefined, undefined, true, parentSubcategoryId);
  }

  createSubSubCategory(data: Partial<B2BSubSubCategory>): Observable<any> {
    return this.subcategoryService.createSubcategory(data as Subcategory);
  }

  updateSubSubCategory(id: string, data: Partial<B2BSubSubCategory>): Observable<any> {
    return this.subcategoryService.updateSubcategory(id, data);
  }

  deleteSubSubCategory(id: string): Observable<any> {
    return this.subcategoryService.deleteSubcategory(id);
  }

  // ── Products ───────────────────────────────────────────────────────────────

  getB2BProducts(page = 1, limit = 20, search?: string, category?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('isB2B', 'true');
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<any>(`${environment.apiUrl}/products`, { params });
  }

  createProduct(data: Partial<B2BProduct>): Observable<any> {
    return this.productService.createProduct(data as Product);
  }

  updateProduct(id: string, data: Partial<B2BProduct>): Observable<any> {
    return this.productService.updateProduct(id, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.productService.deleteProduct(id);
  }

  getProductById(id: string): Observable<any> {
    return this.productService.getProductById(id);
  }

  // ── Vendors ────────────────────────────────────────────────────────────────

  getVendors(page = 1, limit = 20, search?: string): Observable<B2BVendorResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<B2BVendorResponse>(this.vendorApiUrl, { params });
  }

  createVendor(data: Partial<B2BVendor>): Observable<any> {
    return this.http.post(this.vendorApiUrl, data);
  }

  bulkCreateVendors(data: Partial<B2BVendor>[]): Observable<any> {
    return this.http.post(`${this.vendorApiUrl}/bulk-create`, data);
  }

  updateVendor(id: string, data: Partial<B2BVendor>): Observable<any> {
    return this.http.put(`${this.vendorApiUrl}/${id}`, data);
  }

  deleteVendor(id: string): Observable<any> {
    return this.http.delete(`${this.vendorApiUrl}/${id}`);
  }

  getVendorById(id: string): Observable<any> {
    return this.http.get(`${this.vendorApiUrl}/${id}`);
  }

  // ── Step Form Submit (5 steps) ─────────────────────────────────────────────

  /**
   * Submit all 5 steps sequentially:
   * Category → Sub-Category → Sub-Sub Category → Product → Vendor
   */
  submitStepForm(data: B2BStepFormData): Observable<any> {
    return new Observable(observer => {
      const run = async () => {
        try {
          // Step 1: Create / use existing category
          let categoryId = (data.step1_category as any)._id;
          if (!categoryId) {
            const catRes: any = await this.createCategory(data.step1_category).toPromise();
            categoryId = catRes?.data?._id ?? catRes?.data?.category?._id;
          }

          // Step 2: Create / use existing sub-category linked to category
          let subcategoryId = (data.step2_subcategory as any)._id;
          if (!subcategoryId && data.step2_subcategory.name) {
            const subRes: any = await this.createSubcategory({
              ...data.step2_subcategory,
              category: categoryId
            }).toPromise();
            subcategoryId = subRes?.data?._id ?? subRes?.data?.subcategory?._id;
          }

          // Step 3: Create / use existing sub-sub-category linked to sub-category
          let subSubCategoryId = (data.step3_subSubCategory as any)._id;
          if (!subSubCategoryId && data.step3_subSubCategory.name) {
            const sscRes: any = await this.createSubSubCategory({
              ...data.step3_subSubCategory,
              category: categoryId,
              parentSubcategory: subcategoryId
            }).toPromise();
            subSubCategoryId = sscRes?.data?._id ?? sscRes?.data?.subcategory?._id;
          }

          // Step 4: Create product linked to category + sub-sub-category
          let productId = (data.step4_product as any)._id;
          if (!productId && data.step4_product.name) {
            const prodRes: any = await this.createProduct({
              ...data.step4_product,
              category: categoryId,
              subCategory: subSubCategoryId ?? subcategoryId,
              isB2B: true
            }).toPromise();
            productId = prodRes?.data?._id ?? prodRes?.data?.product?._id;
          }

          // Step 5: Create vendor (supplier)
          if (data.step5_vendor.name) {
            await this.createVendor({
              ...data.step5_vendor,
              isB2BVendor: true,
              productIds: productId ? [productId] : []
            }).toPromise();
          }

          observer.next({ success: true, categoryId, subcategoryId, subSubCategoryId, productId });
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      };
      run();
    });
  }

  // ── Dashboard Stats ────────────────────────────────────────────────────────

  getDashboardStats(): Observable<any> {
    return forkJoin({
      categories: this.categoryService.getAllCategories(1, 1, undefined, true),
      subcategories: this.subcategoryService.getAllSubcategories(1, 1, undefined, undefined, true),
      products: this.getB2BProducts(1, 1),
      vendors: this.getVendors(1, 1)
    });
  }
}
