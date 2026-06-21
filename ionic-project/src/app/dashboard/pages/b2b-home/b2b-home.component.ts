import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../../services/cart';
import { WishlistService } from '../../../services/wishlist';
import { HeaderComponent } from '../../components/header/header.component';

interface SupplierInfo {
  supplierId: string;
  supplierName: string;
  rating: number;
  reviewCount: number;
  price: number;
  unit: string;
  location: string;
  responseRate: number;
  hasGST: boolean;
  hasEmail: boolean;
  hasMobile: boolean;
  memberSince: string;
  bulkPricing?: BulkPrice[];
}

interface BulkPrice {
  quantity: number;
  unit: string;
  price: number;
  discount: number;
}

interface B2BProduct {
  productId: string;
  productName: string;
  category: string;
  variety: string;
  image: string;
  supplier: SupplierInfo;
}

@Component({
  selector: 'app-b2b-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './b2b-home.component.html',
  styleUrls: ['./b2b-home.component.scss']
})
export class B2bHomeComponent implements OnInit {
  searchText = '';
  selectedCity = '';
  selectedPriceRange = '';
  selectedVariety = '';
  selectedLocality = '';
  selectedProductId = '';
  viewMode: 'grid' | 'list' = 'list';
  expandedRows = new Set<string>();

  cities = ['Pune', 'Pimpri Chinchwad', 'Raigad', 'Baramati', 'Mumbai', 'Thane', 'Hyderabad', 'Bengaluru', 'Coimbatore', 'Chennai', 'Delhi', 'All India'];
  priceRanges = ['Below ₹70', '₹71 - ₹90', '₹91 - ₹100', 'Above ₹101'];
  varieties = ['1121', '1509', 'Pusa', 'Traditional', '1718', '1401'];
  localities = ['Gultekdi', 'Market Yard'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['productId']) {
        this.selectedProductId = params['productId'];
      }
    });
  }

  products: B2BProduct[] = [
    // P001 - Basmati Rice 1121 (4 vendors)
    {
      productId: 'P001',
      productName: 'Basmati Rice 1121',
      category: 'Grocery & Staples',
      variety: '1121',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S001',
        supplierName: 'Amam Enterprises',
        rating: 4.0,
        reviewCount: 6,
        price: 88,
        unit: 'Kg',
        location: 'Pune - Market Yard',
        responseRate: 71,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '10 yrs',
        bulkPricing: [
          { quantity: 5, unit: 'Kg', price: 87, discount: 1 },
          { quantity: 10, unit: 'Kg', price: 86, discount: 2 },
          { quantity: 25, unit: 'Kg', price: 84, discount: 5 },
          { quantity: 50, unit: 'Kg', price: 82, discount: 7 },
          { quantity: 100, unit: 'Kg', price: 79, discount: 10 },
          { quantity: 250, unit: 'Kg', price: 75, discount: 15 }
        ]
      }
    },
    {
      productId: 'P001',
      productName: 'Basmati Rice 1121',
      category: 'Grocery & Staples',
      variety: '1121',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S002',
        supplierName: 'Vinsark Foods Private Limited',
        rating: 3.5,
        reviewCount: 17,
        price: 95,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 85,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '5 yrs',
        bulkPricing: [
          { quantity: 5, unit: 'Kg', price: 93, discount: 2 },
          { quantity: 10, unit: 'Kg', price: 92, discount: 3 },
          { quantity: 25, unit: 'Kg', price: 90, discount: 5 },
          { quantity: 50, unit: 'Kg', price: 88, discount: 7 },
          { quantity: 100, unit: 'Kg', price: 85, discount: 11 },
          { quantity: 200, unit: 'Kg', price: 81, discount: 15 }
        ]
      }
    },
    {
      productId: 'P001',
      productName: 'Basmati Rice 1121',
      category: 'Grocery & Staples',
      variety: '1121',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S003',
        supplierName: 'Pannalal Bansilal',
        rating: 4.7,
        reviewCount: 33,
        price: 115,
        unit: 'Kg',
        location: 'Pune - Market Yard',
        responseRate: 95,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '8 yrs',
        bulkPricing: [
          { quantity: 5, unit: 'Kg', price: 110, discount: 4 },
          { quantity: 10, unit: 'Kg', price: 112, discount: 3 },
          { quantity: 20, unit: 'Kg', price: 109, discount: 5 },
          { quantity: 50, unit: 'Kg', price: 106, discount: 8 },
          { quantity: 100, unit: 'Kg', price: 103, discount: 10 },
          { quantity: 200, unit: 'Kg', price: 98, discount: 15 }
        ]
      }
    },
    {
      productId: 'P001',
      productName: 'Basmati Rice 1121',
      category: 'Grocery & Staples',
      variety: '1121',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S004',
        supplierName: 'Green Valley Trading',
        rating: 4.2,
        reviewCount: 28,
        price: 75,
        unit: 'Kg',
        location: 'Thane',
        responseRate: 78,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '3 yrs',
        bulkPricing: [
          { quantity: 10, unit: 'Kg', price: 73, discount: 3 },
          { quantity: 25, unit: 'Kg', price: 72, discount: 4 },
          { quantity: 50, unit: 'Kg', price: 70, discount: 7 },
          { quantity: 100, unit: 'Kg', price: 68, discount: 9 },
          { quantity: 250, unit: 'Kg', price: 65, discount: 13 },
          { quantity: 500, unit: 'Kg', price: 62, discount: 17 }
        ]
      }
    },

    // P002 - Toor Dal (4 vendors)
    {
      productId: 'P002',
      productName: 'Toor Dal (Arhar)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc',
      supplier: {
        supplierId: 'S005',
        supplierName: 'Dal Traders Mumbai',
        rating: 4.5,
        reviewCount: 52,
        price: 95,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 88,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '12 yrs',
        bulkPricing: [
          { quantity: 10, unit: 'Kg', price: 93, discount: 2 },
          { quantity: 15, unit: 'Kg', price: 92, discount: 3 },
          { quantity: 50, unit: 'Kg', price: 88, discount: 7 },
          { quantity: 75, unit: 'Kg', price: 86, discount: 9 },
          { quantity: 150, unit: 'Kg', price: 81, discount: 15 },
          { quantity: 300, unit: 'Kg', price: 76, discount: 20 }
        ]
      }
    },
    {
      productId: 'P002',
      productName: 'Toor Dal (Arhar)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc',
      supplier: {
        supplierId: 'S006',
        supplierName: 'Pulse Merchants',
        rating: 4.3,
        reviewCount: 41,
        price: 92,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 82,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '7 yrs',
        bulkPricing: [
          { quantity: 10, unit: 'Kg', price: 90, discount: 2 },
          { quantity: 20, unit: 'Kg', price: 89, discount: 3 },
          { quantity: 40, unit: 'Kg', price: 87, discount: 5 },
          { quantity: 50, unit: 'Kg', price: 85, discount: 8 },
          { quantity: 200, unit: 'Kg', price: 79, discount: 14 },
          { quantity: 400, unit: 'Kg', price: 74, discount: 20 }
        ]
      }
    },
    {
      productId: 'P002',
      productName: 'Toor Dal (Arhar)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc',
      supplier: {
        supplierId: 'S007',
        supplierName: 'Quality Dal Ltd',
        rating: 4.6,
        reviewCount: 67,
        price: 120,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 91,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '15 yrs',
        bulkPricing: [
          { quantity: 15, unit: 'Kg', price: 117, discount: 3 },
          { quantity: 30, unit: 'Kg', price: 115, discount: 4 },
          { quantity: 60, unit: 'Kg', price: 112, discount: 7 },
          { quantity: 100, unit: 'Kg', price: 108, discount: 10 },
          { quantity: 300, unit: 'Kg', price: 102, discount: 15 },
          { quantity: 500, unit: 'Kg', price: 96, discount: 20 }
        ]
      }
    },
    {
      productId: 'P002',
      productName: 'Toor Dal (Arhar)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc',
      supplier: {
        supplierId: 'S008',
        supplierName: 'Shri Krishna Pulses',
        rating: 4.1,
        reviewCount: 29,
        price: 98,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 75,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '5 yrs',
        bulkPricing: [
          { quantity: 10, unit: 'Kg', price: 96, discount: 2 },
          { quantity: 25, unit: 'Kg', price: 94, discount: 4 },
          { quantity: 50, unit: 'Kg', price: 91, discount: 7 },
          { quantity: 75, unit: 'Kg', price: 88, discount: 10 },
          { quantity: 150, unit: 'Kg', price: 84, discount: 14 },
          { quantity: 300, unit: 'Kg', price: 79, discount: 19 }
        ]
      }
    },

    // P003 - Sunflower Oil (4 vendors)
    {
      productId: 'P003',
      productName: 'Sunflower Oil',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S009',
        supplierName: 'Oil Corporation Ltd',
        rating: 4.4,
        reviewCount: 88,
        price: 145,
        unit: 'L',
        location: 'Mumbai',
        responseRate: 86,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '10 yrs'
      }
    },
    {
      productId: 'P003',
      productName: 'Sunflower Oil',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S010',
        supplierName: 'Golden Oil Traders',
        rating: 4.7,
        reviewCount: 120,
        price: 142,
        unit: 'L',
        location: 'Pune',
        responseRate: 93,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '18 yrs'
      }
    },
    {
      productId: 'P003',
      productName: 'Sunflower Oil',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S011',
        supplierName: 'Pure Oils India',
        rating: 4.2,
        reviewCount: 45,
        price: 165,
        unit: 'L',
        location: 'Bengaluru',
        responseRate: 79,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '6 yrs'
      }
    },
    {
      productId: 'P003',
      productName: 'Sunflower Oil',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S012',
        supplierName: 'Sunrise Edibles',
        rating: 4.0,
        reviewCount: 33,
        price: 140,
        unit: 'L',
        location: 'Chennai',
        responseRate: 74,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '4 yrs'
      }
    },

    // P004 - Wheat Atta (4 vendors)
    {
      productId: 'P004',
      productName: 'Wheat Atta (Whole Wheat Flour)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S013',
        supplierName: 'Grain Masters',
        rating: 4.5,
        reviewCount: 78,
        price: 38,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 87,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '11 yrs'
      }
    },
    {
      productId: 'P004',
      productName: 'Wheat Atta (Whole Wheat Flour)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S014',
        supplierName: 'Atta Mills India',
        rating: 4.2,
        reviewCount: 55,
        price: 32,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 81,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '8 yrs'
      }
    },
    {
      productId: 'P004',
      productName: 'Wheat Atta (Whole Wheat Flour)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S015',
        supplierName: 'Fresh Flour Pvt Ltd',
        rating: 4.7,
        reviewCount: 142,
        price: 40,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 94,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '20 yrs'
      }
    },
    {
      productId: 'P004',
      productName: 'Wheat Atta (Whole Wheat Flour)',
      category: 'Grocery & Staples',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S016',
        supplierName: 'Organic Atta Suppliers',
        rating: 3.9,
        reviewCount: 31,
        price: 35,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 70,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '5 yrs'
      }
    },

    // P005 - Sugar (4 vendors)
    {
      productId: 'P005',
      productName: 'Sugar (White Refined)',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg',
      supplier: {
        supplierId: 'S017',
        supplierName: 'Sweet Suppliers',
        rating: 4.3,
        reviewCount: 92,
        price: 42,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 84,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '14 yrs'
      }
    },
    {
      productId: 'P005',
      productName: 'Sugar (White Refined)',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg',
      supplier: {
        supplierId: 'S018',
        supplierName: 'Sugar Mills Corp',
        rating: 4.6,
        reviewCount: 108,
        price: 40,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 90,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '16 yrs'
      }
    },
    {
      productId: 'P005',
      productName: 'Sugar (White Refined)',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg',
      supplier: {
        supplierId: 'S019',
        supplierName: 'Premium Sugar Ltd',
        rating: 4.1,
        reviewCount: 47,
        price: 50,
        unit: 'Kg',
        location: 'Chennai',
        responseRate: 76,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '7 yrs'
      }
    },
    {
      productId: 'P005',
      productName: 'Sugar (White Refined)',
      category: 'Grocery & Staples',
      variety: 'Refined',
      image: 'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg',
      supplier: {
        supplierId: 'S020',
        supplierName: 'Quality Sugar Traders',
        rating: 3.8,
        reviewCount: 29,
        price: 38,
        unit: 'Kg',
        location: 'Thane',
        responseRate: 68,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '4 yrs'
      }
    },

    // P006 - Turmeric Powder (4 vendors)
    {
      productId: 'P006',
      productName: 'Turmeric Powder',
      category: 'Grocery & Staples',
      variety: 'Organic',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S021',
        supplierName: 'Spice Traders',
        rating: 4.4,
        reviewCount: 85,
        price: 200,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 85,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '12 yrs'
      }
    },
    {
      productId: 'P006',
      productName: 'Turmeric Powder',
      category: 'Grocery & Staples',
      variety: 'Organic',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S022',
        supplierName: 'Golden Spices',
        rating: 4.7,
        reviewCount: 134,
        price: 250,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 93,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '18 yrs'
      }
    },
    {
      productId: 'P006',
      productName: 'Turmeric Powder',
      category: 'Grocery & Staples',
      variety: 'Organic',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S023',
        supplierName: 'Organic Turmeric Co',
        rating: 4.2,
        reviewCount: 56,
        price: 230,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 79,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '9 yrs'
      }
    },
    {
      productId: 'P006',
      productName: 'Turmeric Powder',
      category: 'Grocery & Staples',
      variety: 'Organic',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S024',
        supplierName: 'Haldi Merchants',
        rating: 4.0,
        reviewCount: 38,
        price: 180,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 72,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '6 yrs'
      }
    },

    // P007 - Red Chilli Powder (4 vendors)
    {
      productId: 'P007',
      productName: 'Red Chilli Powder',
      category: 'Grocery & Staples',
      variety: 'Extra Hot',
      image: 'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S025',
        supplierName: 'Chilli Express',
        rating: 4.5,
        reviewCount: 97,
        price: 240,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 88,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '15 yrs'
      }
    },
    {
      productId: 'P007',
      productName: 'Red Chilli Powder',
      category: 'Grocery & Staples',
      variety: 'Extra Hot',
      image: 'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S026',
        supplierName: 'Hot Spices Ltd',
        rating: 4.3,
        reviewCount: 72,
        price: 260,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 82,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '11 yrs'
      }
    },
    {
      productId: 'P007',
      productName: 'Red Chilli Powder',
      category: 'Grocery & Staples',
      variety: 'Extra Hot',
      image: 'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S027',
        supplierName: 'Mirchi Masala Corp',
        rating: 4.6,
        reviewCount: 118,
        price: 280,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 91,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '17 yrs'
      }
    },
    {
      productId: 'P007',
      productName: 'Red Chilli Powder',
      category: 'Grocery & Staples',
      variety: 'Extra Hot',
      image: 'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S028',
        supplierName: 'Fiery Foods',
        rating: 4.1,
        reviewCount: 43,
        price: 220,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 75,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '7 yrs'
      }
    },

    // P008 - Moong Dal (4 vendors)
    {
      productId: 'P008',
      productName: 'Moong Dal (Green Gram)',
      category: 'Grocery & Staples',
      variety: 'Split',
      image: 'https://images.unsplash.com/photo-1584853483009-4a0a4cca4c3f?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S029',
        supplierName: 'Green Dal Suppliers',
        rating: 4.4,
        reviewCount: 66,
        price: 105,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 83,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '10 yrs'
      }
    },
    {
      productId: 'P008',
      productName: 'Moong Dal (Green Gram)',
      category: 'Grocery & Staples',
      variety: 'Split',
      image: 'https://images.unsplash.com/photo-1584853483009-4a0a4cca4c3f?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S030',
        supplierName: 'Pulse Paradise',
        rating: 4.6,
        reviewCount: 101,
        price: 120,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 90,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '14 yrs'
      }
    },
    {
      productId: 'P008',
      productName: 'Moong Dal (Green Gram)',
      category: 'Grocery & Staples',
      variety: 'Split',
      image: 'https://images.unsplash.com/photo-1584853483009-4a0a4cca4c3f?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S031',
        supplierName: 'Organic Moong Ltd',
        rating: 4.2,
        reviewCount: 49,
        price: 125,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 77,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '8 yrs'
      }
    },
    {
      productId: 'P008',
      productName: 'Moong Dal (Green Gram)',
      category: 'Grocery & Staples',
      variety: 'Split',
      image: 'https://images.unsplash.com/photo-1584853483009-4a0a4cca4c3f?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S032',
        supplierName: 'Dal Bazaar',
        rating: 3.9,
        reviewCount: 34,
        price: 95,
        unit: 'Kg',
        location: 'Chennai',
        responseRate: 69,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '5 yrs'
      }
    },

    // P009 - Full Cream Milk Powder (4 vendors)
    {
      productId: 'P009',
      productName: 'Full Cream Milk Powder',
      category: 'Dairy & Frozen',
      variety: 'Premium',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S033',
        supplierName: 'Dairy Fresh Ltd',
        rating: 4.7,
        reviewCount: 145,
        price: 350,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 94,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '20 yrs'
      }
    },
    {
      productId: 'P009',
      productName: 'Full Cream Milk Powder',
      category: 'Dairy & Frozen',
      variety: 'Premium',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S034',
        supplierName: 'Milk Masters',
        rating: 4.5,
        reviewCount: 112,
        price: 320,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 87,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '15 yrs'
      }
    },
    {
      productId: 'P009',
      productName: 'Full Cream Milk Powder',
      category: 'Dairy & Frozen',
      variety: 'Premium',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S035',
        supplierName: 'Creamy Delights',
        rating: 4.3,
        reviewCount: 78,
        price: 380,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 81,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '12 yrs'
      }
    },
    {
      productId: 'P009',
      productName: 'Full Cream Milk Powder',
      category: 'Dairy & Frozen',
      variety: 'Premium',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S036',
        supplierName: 'Dairy Valley',
        rating: 4.1,
        reviewCount: 54,
        price: 340,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 74,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '9 yrs'
      }
    },

    // P010 - Pure Desi Ghee (4 vendors)
    {
      productId: 'P010',
      productName: 'Pure Desi Ghee',
      category: 'Dairy & Frozen',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S037',
        supplierName: 'Ghee Grih',
        rating: 4.8,
        reviewCount: 178,
        price: 520,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 96,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '25 yrs'
      }
    },
    {
      productId: 'P010',
      productName: 'Pure Desi Ghee',
      category: 'Dairy & Frozen',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S038',
        supplierName: 'Golden Ghee Ltd',
        rating: 4.6,
        reviewCount: 139,
        price: 480,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 91,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '18 yrs'
      }
    },
    {
      productId: 'P010',
      productName: 'Pure Desi Ghee',
      category: 'Dairy & Frozen',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S039',
        supplierName: 'Farm Fresh Ghee',
        rating: 4.4,
        reviewCount: 92,
        price: 550,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 85,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '14 yrs'
      }
    },
    {
      productId: 'P010',
      productName: 'Pure Desi Ghee',
      category: 'Dairy & Frozen',
      variety: 'Traditional',
      image: 'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S040',
        supplierName: 'Organic Ghee House',
        rating: 4.2,
        reviewCount: 66,
        price: 450,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 78,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '10 yrs'
      }
    },

    // P011 - Frozen Mixed Vegetables (4 vendors)
    {
      productId: 'P011',
      productName: 'Frozen Mixed Vegetables',
      category: 'Dairy & Frozen',
      variety: 'Mixed',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S041',
        supplierName: 'FrozenVeg Co',
        rating: 4.3,
        reviewCount: 71,
        price: 65,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 82,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '11 yrs'
      }
    },
    {
      productId: 'P011',
      productName: 'Frozen Mixed Vegetables',
      category: 'Dairy & Frozen',
      variety: 'Mixed',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S042',
        supplierName: 'Cold Storage Veggies',
        rating: 4.5,
        reviewCount: 95,
        price: 70,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 88,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '13 yrs'
      }
    },
    {
      productId: 'P011',
      productName: 'Frozen Mixed Vegetables',
      category: 'Dairy & Frozen',
      variety: 'Mixed',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S043',
        supplierName: 'Fresh Freeze Ltd',
        rating: 4.1,
        reviewCount: 48,
        price: 75,
        unit: 'Kg',
        location: 'Chennai',
        responseRate: 75,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '7 yrs'
      }
    },
    {
      productId: 'P011',
      productName: 'Frozen Mixed Vegetables',
      category: 'Dairy & Frozen',
      variety: 'Mixed',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S044',
        supplierName: 'Quick Freeze Foods',
        rating: 3.9,
        reviewCount: 35,
        price: 55,
        unit: 'Kg',
        location: 'Thane',
        responseRate: 67,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '5 yrs'
      }
    },

    // P012 - Paneer (4 vendors)
    {
      productId: 'P012',
      productName: 'Paneer (Cottage Cheese)',
      category: 'Dairy & Frozen',
      variety: 'Fresh',
      image: 'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019',
      supplier: {
        supplierId: 'S045',
        supplierName: 'Paneer Palace',
        rating: 4.6,
        reviewCount: 124,
        price: 320,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 89,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '16 yrs'
      }
    },
    {
      productId: 'P012',
      productName: 'Paneer (Cottage Cheese)',
      category: 'Dairy & Frozen',
      variety: 'Fresh',
      image: 'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019',
      supplier: {
        supplierId: 'S046',
        supplierName: 'Fresh Cottage Dairy',
        rating: 4.4,
        reviewCount: 87,
        price: 300,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 84,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '12 yrs'
      }
    },
    {
      productId: 'P012',
      productName: 'Paneer (Cottage Cheese)',
      category: 'Dairy & Frozen',
      variety: 'Fresh',
      image: 'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019',
      supplier: {
        supplierId: 'S047',
        supplierName: 'Cheese Corner',
        rating: 4.7,
        reviewCount: 156,
        price: 340,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 92,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '19 yrs'
      }
    },
    {
      productId: 'P012',
      productName: 'Paneer (Cottage Cheese)',
      category: 'Dairy & Frozen',
      variety: 'Fresh',
      image: 'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019',
      supplier: {
        supplierId: 'S048',
        supplierName: 'Dairy Delights',
        rating: 4.2,
        reviewCount: 63,
        price: 280,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 76,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '9 yrs'
      }
    },

    // P013 - Potato Chips (4 vendors)
    {
      productId: 'P013',
      productName: 'Potato Chips (Party Pack)',
      category: 'Packaged Foods',
      variety: 'Masala',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S049',
        supplierName: 'Crispy Snacks Ltd',
        rating: 4.3,
        reviewCount: 94,
        price: 195,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 83,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '14 yrs'
      }
    },
    {
      productId: 'P013',
      productName: 'Potato Chips (Party Pack)',
      category: 'Packaged Foods',
      variety: 'Masala',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S050',
        supplierName: 'Party Chips Co',
        rating: 4.5,
        reviewCount: 118,
        price: 210,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 87,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '17 yrs'
      }
    },
    {
      productId: 'P013',
      productName: 'Potato Chips (Party Pack)',
      category: 'Packaged Foods',
      variety: 'Masala',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S051',
        supplierName: 'Snack Masters',
        rating: 4.1,
        reviewCount: 67,
        price: 220,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 77,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '10 yrs'
      }
    },
    {
      productId: 'P013',
      productName: 'Potato Chips (Party Pack)',
      category: 'Packaged Foods',
      variety: 'Masala',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S052',
        supplierName: 'Crunchy Delights',
        rating: 3.9,
        reviewCount: 42,
        price: 180,
        unit: 'Kg',
        location: 'Chennai',
        responseRate: 70,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '6 yrs'
      }
    },

    // P014 - Cream Biscuits (4 vendors)
    {
      productId: 'P014',
      productName: 'Cream Biscuits',
      category: 'Packaged Foods',
      variety: 'Sweet',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S053',
        supplierName: 'Biscuit Bazaar',
        rating: 4.4,
        reviewCount: 103,
        price: 145,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 85,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '15 yrs'
      }
    },
    {
      productId: 'P014',
      productName: 'Cream Biscuits',
      category: 'Packaged Foods',
      variety: 'Sweet',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S054',
        supplierName: 'Cookie Craze',
        rating: 4.6,
        reviewCount: 132,
        price: 155,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 90,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '18 yrs'
      }
    },
    {
      productId: 'P014',
      productName: 'Cream Biscuits',
      category: 'Packaged Foods',
      variety: 'Sweet',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S055',
        supplierName: 'Creamy Treats',
        rating: 4.2,
        reviewCount: 76,
        price: 160,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 79,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '11 yrs'
      }
    },
    {
      productId: 'P014',
      productName: 'Cream Biscuits',
      category: 'Packaged Foods',
      variety: 'Sweet',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S056',
        supplierName: 'Sweet Bites',
        rating: 4.0,
        reviewCount: 51,
        price: 120,
        unit: 'Kg',
        location: 'Thane',
        responseRate: 72,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '8 yrs'
      }
    },

    // P015 - Instant Noodles (4 vendors)
    {
      productId: 'P015',
      productName: 'Instant Noodles (Bulk)',
      category: 'Packaged Foods',
      variety: 'Vegetarian',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S057',
        supplierName: 'Noodle Nation',
        rating: 4.3,
        reviewCount: 89,
        price: 265,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 84,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '13 yrs'
      }
    },
    {
      productId: 'P015',
      productName: 'Instant Noodles (Bulk)',
      category: 'Packaged Foods',
      variety: 'Vegetarian',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S058',
        supplierName: 'Quick Meals Ltd',
        rating: 4.5,
        reviewCount: 114,
        price: 250,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 88,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '16 yrs'
      }
    },
    {
      productId: 'P015',
      productName: 'Instant Noodles (Bulk)',
      category: 'Packaged Foods',
      variety: 'Vegetarian',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S059',
        supplierName: 'Insta Foods Co',
        rating: 4.1,
        reviewCount: 62,
        price: 280,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 76,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '9 yrs'
      }
    },
    {
      productId: 'P015',
      productName: 'Instant Noodles (Bulk)',
      category: 'Packaged Foods',
      variety: 'Vegetarian',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S060',
        supplierName: 'Fast Food Supplies',
        rating: 3.9,
        reviewCount: 44,
        price: 240,
        unit: 'Kg',
        location: 'Chennai',
        responseRate: 69,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '6 yrs'
      }
    },

    // P016 - Dark Chocolate Bars (4 vendors)
    {
      productId: 'P016',
      productName: 'Dark Chocolate Bars',
      category: 'Packaged Foods',
      variety: '70% Cocoa',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGRcYGRcYGBgaGBoaGBYXFhcXGBgYHSggGBolHRcVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICUtNS0tLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgMEAAIHAf/EAEYQAAECBAQDBQUFBguZRayM',
      supplier: {
        supplierId: 'S061',
        supplierName: 'Choco Paradise',
        rating: 4.7,
        reviewCount: 167,
        price: 520,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 93,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '21 yrs'
      }
    },
    {
      productId: 'P016',
      productName: 'Dark Chocolate Bars',
      category: 'Packaged Foods',
      variety: '70% Cocoa',
image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGRcYGRcYGBgaGBoaGBYXFhcXGBgYHSggGBolHRcVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICUtNS0tLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAACIgnMBAQAAA',
      supplier: {
        supplierId: 'S062',
        supplierName: 'Cocoa Delights',
        rating: 4.5,
        reviewCount: 129,
        price: 485,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 87,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '17 yrs'
      }
    },
    {
      productId: 'P016',
      productName: 'Dark Chocolate Bars',
      category: 'Packaged Foods',
      variety: '70% Cocoa',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGRcYGRcYGBgaGBoaGBYXFhcXGBgYHSggGBolHRcVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICUtNS0tLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIOOEA4',
      supplier: {
        supplierId: 'S063',
        supplierName: 'Premium Chocolate Ltd',
        rating: 4.8,
        reviewCount: 203,
        price: 550,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 95,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '24 yrs'
      }
    },
    {
      productId: 'P016',
      productName: 'Dark Chocolate Bars',
      category: 'Packaged Foods',
      variety: '70% Cocoa',
      image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S064',
        supplierName: 'Dark Treats Co',
        rating: 4.3,
        reviewCount: 84,
        price: 450,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 80,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '13 yrs'
      }
    },

    // P017 - Cornflakes (4 vendors)
    {
      productId: 'P017',
      productName: 'Cornflakes',
      category: 'Packaged Foods',
      variety: 'Honey',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S065',
        supplierName: 'Cereal King',
        rating: 4.4,
        reviewCount: 96,
        price: 255,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 85,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '14 yrs'
      }
    },
    {
      productId: 'P017',
      productName: 'Cornflakes',
      category: 'Packaged Foods',
      variety: 'Honey',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S066',
        supplierName: 'Morning Crunch',
        rating: 4.6,
        reviewCount: 127,
        price: 270,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 89,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '17 yrs'
      }
    },
    {
      productId: 'P017',
      productName: 'Cornflakes',
      category: 'Packaged Foods',
      variety: 'Honey',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S067',
        supplierName: 'Breakfast Bliss',
        rating: 4.2,
        reviewCount: 71,
        price: 280,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 78,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '10 yrs'
      }
    },
    {
      productId: 'P017',
      productName: 'Cornflakes',
      category: 'Packaged Foods',
      variety: 'Honey',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S068',
        supplierName: 'Golden Grains',
        rating: 4.0,
        reviewCount: 52,
        price: 220,
        unit: 'Kg',
        location: 'Chennai',
        responseRate: 71,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '8 yrs'
      }
    },

    // P018 - Masala Namkeen (4 vendors)
    {
      productId: 'P018',
      productName: 'Masala Namkeen',
      category: 'Packaged Foods',
      variety: 'Spicy',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S069',
        supplierName: 'Namkeen Palace',
        rating: 4.5,
        reviewCount: 109,
        price: 205,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 86,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '15 yrs'
      }
    },
    {
      productId: 'P018',
      productName: 'Masala Namkeen',
      category: 'Packaged Foods',
      variety: 'Spicy',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S070',
        supplierName: 'Spicy Snacks Co',
        rating: 4.3,
        reviewCount: 87,
        price: 195,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 82,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '12 yrs'
      }
    },
    {
      productId: 'P018',
      productName: 'Masala Namkeen',
      category: 'Packaged Foods',
      variety: 'Spicy',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S071',
        supplierName: 'Crunchy Namkeens',
        rating: 4.6,
        reviewCount: 138,
        price: 230,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 91,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '18 yrs'
      }
    },
    {
      productId: 'P018',
      productName: 'Masala Namkeen',
      category: 'Packaged Foods',
      variety: 'Spicy',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S072',
        supplierName: 'Masala Treats',
        rating: 4.1,
        reviewCount: 58,
        price: 180,
        unit: 'Kg',
        location: 'Thane',
        responseRate: 74,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '9 yrs'
      }
    },

    // P019 - Detergent Powder (4 vendors)
    {
      productId: 'P019',
      productName: 'Detergent Powder (Bulk)',
      category: 'Home & Personal Care',
      variety: 'Extra Clean',
      image: 'https://images.unsplash.com/photo-1563822249366-3effd6d5be16?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S073',
        supplierName: 'Clean House Ltd',
        rating: 4.4,
        reviewCount: 102,
        price: 105,
        unit: 'Kg',
        location: 'Mumbai',
        responseRate: 84,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '15 yrs'
      }
    },
    {
      productId: 'P019',
      productName: 'Detergent Powder (Bulk)',
      category: 'Home & Personal Care',
      variety: 'Extra Clean',
      image: 'https://images.unsplash.com/photo-1563822249366-3effd6d5be16?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S074',
        supplierName: 'Super Wash Co',
        rating: 4.6,
        reviewCount: 135,
        price: 110,
        unit: 'Kg',
        location: 'Pune',
        responseRate: 89,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '18 yrs'
      }
    },
    {
      productId: 'P019',
      productName: 'Detergent Powder (Bulk)',
      category: 'Home & Personal Care',
      variety: 'Extra Clean',
      image: 'https://images.unsplash.com/photo-1563822249366-3effd6d5be16?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S075',
        supplierName: 'Sparkle Supplies',
        rating: 4.2,
        reviewCount: 76,
        price: 115,
        unit: 'Kg',
        location: 'Bengaluru',
        responseRate: 79,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '11 yrs'
      }
    },
    {
      productId: 'P019',
      productName: 'Detergent Powder (Bulk)',
      category: 'Home & Personal Care',
      variety: 'Extra Clean',
      image: 'https://images.unsplash.com/photo-1563822249366-3effd6d5be16?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S076',
        supplierName: 'Fresh Cleaner',
        rating: 3.9,
        reviewCount: 49,
        price: 85,
        unit: 'Kg',
        location: 'Hyderabad',
        responseRate: 68,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '7 yrs'
      }
    },

    // P020 - Liquid Hand Wash (4 vendors)
    {
      productId: 'P020',
      productName: 'Liquid Hand Wash',
      category: 'Home & Personal Care',
      variety: 'Antibacterial',
      image: 'https://images.unsplash.com/photo-1585501219557-d7f8754e3d34?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S077',
        supplierName: 'Hygiene First',
        rating: 4.5,
        reviewCount: 115,
        price: 145,
        unit: 'L',
        location: 'Mumbai',
        responseRate: 87,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '16 yrs'
      }
    },
    {
      productId: 'P020',
      productName: 'Liquid Hand Wash',
      category: 'Home & Personal Care',
      variety: 'Antibacterial',
      image: 'https://images.unsplash.com/photo-1585501219557-d7f8754e3d34?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S078',
        supplierName: 'Germ Shield Ltd',
        rating: 4.7,
        reviewCount: 148,
        price: 155,
        unit: 'L',
        location: 'Pune',
        responseRate: 92,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '19 yrs'
      }
    },
    {
      productId: 'P020',
      productName: 'Liquid Hand Wash',
      category: 'Home & Personal Care',
      variety: 'Antibacterial',
      image: 'https://images.unsplash.com/photo-1585501219557-d7f8754e3d34?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S079',
        supplierName: 'Clean Hands Co',
        rating: 4.3,
        reviewCount: 85,
        price: 160,
        unit: 'L',
        location: 'Chennai',
        responseRate: 81,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '12 yrs'
      }
    },
    {
      productId: 'P020',
      productName: 'Liquid Hand Wash',
      category: 'Home & Personal Care',
      variety: 'Antibacterial',
      image: 'https://images.unsplash.com/photo-1585501219557-d7f8754e3d34?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S080',
        supplierName: 'Sanitize Plus',
        rating: 4.1,
        reviewCount: 62,
        price: 120,
        unit: 'L',
        location: 'Bengaluru',
        responseRate: 75,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '9 yrs'
      }
    },

    // P021 - Floor Cleaner (4 vendors)
    {
      productId: 'P021',
      productName: 'Floor Cleaner',
      category: 'Home & Personal Care',
      variety: 'Lemon Fresh',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S081',
        supplierName: 'Floor Shine Ltd',
        rating: 4.4,
        reviewCount: 98,
        price: 115,
        unit: 'L',
        location: 'Mumbai',
        responseRate: 85,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '14 yrs'
      }
    },
    {
      productId: 'P021',
      productName: 'Floor Cleaner',
      category: 'Home & Personal Care',
      variety: 'Lemon Fresh',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S082',
        supplierName: 'Sparkle Floors',
        rating: 4.6,
        reviewCount: 124,
        price: 125,
        unit: 'L',
        location: 'Pune',
        responseRate: 90,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '17 yrs'
      }
    },
    {
      productId: 'P021',
      productName: 'Floor Cleaner',
      category: 'Home & Personal Care',
      variety: 'Lemon Fresh',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S083',
        supplierName: 'Clean Surface Co',
        rating: 4.2,
        reviewCount: 73,
        price: 130,
        unit: 'L',
        location: 'Hyderabad',
        responseRate: 78,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '10 yrs'
      }
    },
    {
      productId: 'P021',
      productName: 'Floor Cleaner',
      category: 'Home & Personal Care',
      variety: 'Lemon Fresh',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S084',
        supplierName: 'Fresh Floors',
        rating: 4.0,
        reviewCount: 55,
        price: 90,
        unit: 'L',
        location: 'Thane',
        responseRate: 70,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '8 yrs'
      }
    },

    // P022 - Toilet Tissue Rolls (4 vendors)
    {
      productId: 'P022',
      productName: 'Toilet Tissue Rolls',
      category: 'Home & Personal Care',
      variety: 'Soft 3-Ply',
      image: 'https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S085',
        supplierName: 'Soft Tissue Co',
        rating: 4.5,
        reviewCount: 117,
        price: 215,
        unit: 'Pack',
        location: 'Mumbai',
        responseRate: 88,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '16 yrs'
      }
    },
    {
      productId: 'P022',
      productName: 'Toilet Tissue Rolls',
      category: 'Home & Personal Care',
      variety: 'Soft 3-Ply',
      image: 'https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S086',
        supplierName: 'Premium Papers',
        rating: 4.7,
        reviewCount: 152,
        price: 225,
        unit: 'Pack',
        location: 'Pune',
        responseRate: 93,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '20 yrs'
      }
    },
    {
      productId: 'P022',
      productName: 'Toilet Tissue Rolls',
      category: 'Home & Personal Care',
      variety: 'Soft 3-Ply',
      image: 'https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S087',
        supplierName: 'Tissue King',
        rating: 4.3,
        reviewCount: 88,
        price: 230,
        unit: 'Pack',
        location: 'Bengaluru',
        responseRate: 82,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '13 yrs'
      }
    },
    {
      productId: 'P022',
      productName: 'Toilet Tissue Rolls',
      category: 'Home & Personal Care',
      variety: 'Soft 3-Ply',
      image: 'https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S088',
        supplierName: 'Quality Tissues',
        rating: 4.1,
        reviewCount: 64,
        price: 180,
        unit: 'Pack',
        location: 'Chennai',
        responseRate: 74,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '9 yrs'
      }
    },

    // P023 - Shampoo (Commercial) (4 vendors)
    {
      productId: 'P023',
      productName: 'Shampoo (Commercial)',
      category: 'Home & Personal Care',
      variety: 'Hair Care',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S089',
        supplierName: 'Hair Care Pro',
        rating: 4.6,
        reviewCount: 139,
        price: 320,
        unit: 'L',
        location: 'Mumbai',
        responseRate: 90,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '18 yrs'
      }
    },
    {
      productId: 'P023',
      productName: 'Shampoo (Commercial)',
      category: 'Home & Personal Care',
      variety: 'Hair Care',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S090',
        supplierName: 'Salon Supplies Ltd',
        rating: 4.8,
        reviewCount: 187,
        price: 340,
        unit: 'L',
        location: 'Pune',
        responseRate: 95,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '22 yrs'
      }
    },
    {
      productId: 'P023',
      productName: 'Shampoo (Commercial)',
      category: 'Home & Personal Care',
      variety: 'Hair Care',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S091',
        supplierName: 'Premium Hair Products',
        rating: 4.4,
        reviewCount: 96,
        price: 350,
        unit: 'L',
        location: 'Bengaluru',
        responseRate: 84,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '14 yrs'
      }
    },
    {
      productId: 'P023',
      productName: 'Shampoo (Commercial)',
      category: 'Home & Personal Care',
      variety: 'Hair Care',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop',
      supplier: {
        supplierId: 'S092',
        supplierName: 'Beauty Essentials',
        rating: 4.2,
        reviewCount: 71,
        price: 280,
        unit: 'L',
        location: 'Hyderabad',
        responseRate: 77,
        hasGST: true,
        hasEmail: true,
        hasMobile: true,
        memberSince: '11 yrs'
      }
    }
  ];

  get filteredProducts(): B2BProduct[] {
    return this.products.filter(product => {
      // Filter by product ID if coming from category page
      const matchesProductId = !this.selectedProductId || product.productId === this.selectedProductId;
      
      const matchesSearch = !this.searchText || 
        product.productName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesCity = !this.selectedCity || 
        product.supplier.location.toLowerCase().includes(this.selectedCity.toLowerCase());
      
      const matchesVariety = !this.selectedVariety || product.variety === this.selectedVariety;
      
      let matchesPrice = true;
      if (this.selectedPriceRange && product.supplier.price > 0) {
        const price = product.supplier.price;
        if (this.selectedPriceRange === 'Below ₹70') matchesPrice = price < 70;
        else if (this.selectedPriceRange === '₹71 - ₹90') matchesPrice = price >= 71 && price <= 90;
        else if (this.selectedPriceRange === '₹91 - ₹100') matchesPrice = price >= 91 && price <= 100;
        else if (this.selectedPriceRange === 'Above ₹101') matchesPrice = price > 101;
      }

      return matchesProductId && matchesSearch && matchesCity && matchesVariety && matchesPrice;
    });
  }

  selectCity(city: string) {
    this.selectedCity = this.selectedCity === city ? '' : city;
  }

  clearFilters() {
    this.selectedCity = '';
    this.selectedPriceRange = '';
    this.selectedVariety = '';
    this.selectedLocality = '';
    this.searchText = '';
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  contactSupplier(product: B2BProduct) {
    console.log('Contacting supplier:', product.supplier.supplierName);
    alert(`Contact Request Sent to ${product.supplier.supplierName} for ${product.productName}`);
  }

  requestQuote(product: B2BProduct) {
    console.log('Requesting quote for:', product.productName);
    alert(`Quote request sent for ${product.productName} from ${product.supplier.supplierName}`);
  }

  viewNumber(product: B2BProduct) {
    alert(`Contact Number: +91-XXXXXXXXXX\n${product.supplier.responseRate}% Response Rate`);
  }

  // Header navigation methods
  get cartItemCount(): number {
    return this.cartService.itemCount();
  }

  addToCart(product: B2BProduct, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.cartService.addToCart({
      productId: product.productId + '-' + product.supplier.supplierId,
      name: `${product.productName} - ${product.supplier.supplierName}`,
      price: product.supplier.price,
      quantity: 1,
      image: product.image
    } as any);

    // Optional: Show a success message
    alert(`${product.productName} from ${product.supplier.supplierName} added to cart!`);
  }

  toggleView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  toggleRow(supplierId: string): void {
    console.log('Toggle row clicked for supplier:', supplierId);
    if (this.expandedRows.has(supplierId)) {
      this.expandedRows.delete(supplierId);
      console.log('Row collapsed');
    } else {
      this.expandedRows.add(supplierId);
      console.log('Row expanded');
    }
    console.log('Expanded rows:', Array.from(this.expandedRows));
  }

  isRowExpanded(supplierId: string): boolean {
    const isExpanded = this.expandedRows.has(supplierId);
    console.log('Check if row expanded - Supplier:', supplierId, 'Expanded:', isExpanded);
    return isExpanded;
  }

  get wishlistCount(): number {
    return this.wishlistService.wishlistCount();
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  viewWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  viewAccount(): void {
    this.router.navigate(['/auth/signin']);
  }
}
