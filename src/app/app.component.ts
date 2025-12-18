import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { ProductService, Product } from './services/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    NgxChartsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  products: Product[] = [];
  chartData: any[] = [];
  isEditMode = false;
  editIndex: number | null = null;

  productForm!: FormGroup;   // declared, initialized later
  
view: [number, number] = [900, 350];
showXAxis = true;
showYAxis = true;
gradient = false;
showLegend = false;
xAxisLabel = 'Product';
yAxisLabel = 'Price';


  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    // ✅ initialize form AFTER fb exists
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      category: ['', Validators.required]
    });

    this.products = this.productService.getProducts();
    this.updateChart();

  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const formValue = this.productForm.value;

    if (this.isEditMode && this.editIndex !== null) {
      const updatedProduct: Product = {
        id: this.products[this.editIndex].id,
        name: formValue.name!,
        price: Number(formValue.price),   // ✅ type safe
        category: formValue.category!
      };

      this.productService.updateProduct(this.editIndex, updatedProduct);
      this.isEditMode = false;
      this.editIndex = null;

    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: formValue.name!,
        price: Number(formValue.price),   // ✅ convert string → number
        category: formValue.category!
      };

      this.productService.addProduct(newProduct);
    }

    this.productForm.reset();
    this.updateChart();
  }

  onEdit(product: Product, index: number) {
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      category: product.category
    });
    this.isEditMode = true;
    this.editIndex = index;
  }

  onDelete(index: number) {
    this.productService.deleteProduct(index);
    this.updateChart();
  }

  updateChart() {
  this.chartData = this.products.map(product => ({
    name: product.name,
    value: product.price
  }));
}

}
