
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { GridDataResult, RowClassArgs, ColumnComponent } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';

import { Product } from './models/product';
import { EditService } from './services/edit.service';
import { ValidationService } from './services/validation.service';

import { map } from 'rxjs/operators/map';

import { ProductSchema } from './schemes/product-schema';
import { MarkupService } from './services/markup.service';
import { filter } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { IfStmt } from '@angular/compiler';


@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    public view: Observable<GridDataResult>;
    
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 10
    };

    public changes: any = {};
    public schema = new ProductSchema();

    public ಠ_ಠ = '୧((#Φ益Φ#))୨';    

    constructor(
        private editService: EditService,
        private validationService: ValidationService,
        private markupService: MarkupService,
        private sanitizer: DomSanitizer
    ) {
        console.log(this.ಠ_ಠ);
    }
    
    public ngOnInit(): void {
        this.view = this.editService.pipe(map(data => process(data, this.gridState)));
        this.editService.read();
    }

    public onStateChange(state: State) {
        this.gridState = state;
        this.editService.read();
    }

    public cellClickHandler({ sender, rowIndex, columnIndex, dataItem, isEdited }) {
        if (!isEdited) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    public cellCloseHandler(args: any) {
        const { formGroup, dataItem } = args;

        if (!formGroup.valid) {
            // prevent closing the edited cell if there are invalid values.
            args.preventDefault();
        } else if (formGroup.dirty) {
            this.editService.assignValues(dataItem, formGroup.value);
            this.editService.update(dataItem);
        }
    }

    public addHandler({ sender }) {
        sender.addRow(this.createFormGroup(new Product()));
    }

    public cancelHandler({ sender, rowIndex }) {
        sender.closeRow(rowIndex);
    }

    public saveHandler({ sender, formGroup, rowIndex }) {
        if (formGroup.valid) {
            this.editService.create(formGroup.value);
            sender.closeRow(rowIndex);
        }
    }

    public removeHandler({ sender, dataItem }) {
        this.editService.remove(dataItem);
        sender.cancelCell();
    }  

    public saveChanges(grid: any): void {
        grid.closeCell();
        grid.cancelCell();
        
        const datasets: object = {
            changedItems: this.editService.updatedItems.concat(this.editService.createdItems),
            allItems: this.editService.data
        };

        const validationErrors = this.validationService.validate(this.schema, datasets);
        this.markupService.doMarkup(validationErrors);
        
        
        this.editService.saveChanges();
    }

    public markup(dataItem: any, columnInfo: ColumnComponent) {
        const result = '#FFBA80';

        if ((dataItem.ProductName === '1') && (columnInfo.field === 'ProductName')) {
            return this.sanitizer.bypassSecurityTrustStyle(result);
        }
        // TODO: Определять, какая ячейка сейчас обрабатывается и применять стиль только к ней
        

    //  switch (dataItem.ProductName) {
    //   case '1' :
    //     result = '#FFBA80';
    //     break;
    //   case '2' :
    //     result = '#B2F699';
    //     break;
    //   default:
    //     result = 'transparent';
    //     break;
    //  }

    //  return this.sanitizer.bypassSecurityTrustStyle(result);
    }

    public cancelChanges(grid: any): void {
        grid.cancelCell();
        this.editService.cancelChanges();
    }

    // Main FormGroup validation with in-form validaton
    public MAINcreateFormGroup(currentData): FormGroup {
        const formGroup: FormGroup = new FormGroup({});

        const editableFields = this.schema.fields.filter(field => {
            if (field.editable) { return field; }
        });

        for (const field of editableFields) {
            const validators = this.schema.getFieldFormValidators(field);
            const control = new FormControl(currentData[field.name], Validators.compose(validators));
            formGroup.addControl(field.name, control);
        }
        return formGroup;
    }

    // FormGroup without form validation, (!!!) USE ONLY FOR VALIDATION SERVICE TESTING
    public createFormGroup(currentData): FormGroup {
        const formGroup: FormGroup = new FormGroup({});

        const editableFields = this.schema.fields.filter(field => {
            if (field.editable) { return field; }
        });

        for (const field of editableFields) {
            const validators = this.schema.getFieldFormValidators(field);
            const control = new FormControl(currentData[field.name]);
            formGroup.addControl(field.name, control);
        }
        return formGroup;
    }

}
