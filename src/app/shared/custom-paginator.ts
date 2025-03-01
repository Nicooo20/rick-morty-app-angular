import { MatPaginatorIntl } from '@angular/material/paginator';

export class CustomPaginator extends MatPaginatorIntl {
    override itemsPerPageLabel = 'Elementos por página:';
    override nextPageLabel = 'Siguiente';
    override previousPageLabel = 'Anterior';
    override firstPageLabel = 'Primera página';
    override lastPageLabel = 'Última página';


    override getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `No hay elementos disponibles`;
        }
        const startIndex = page * pageSize;
        const endIndex = Math.min(startIndex + pageSize, length);
        return `Mostrando ${startIndex + 1} - ${endIndex} de ${length}`;
    };
    // override getRangeLabel = (page: number, pageSize: number, length: number) => {
    //     if (!length || length === 0) {
    //         return `Página 1 de 1`;
    //     }
    
    //     // La API ya nos da la cantidad de páginas, por lo que la calculamos así:
    //     const totalPages = Math.ceil(length / pageSize); 
    //     const currentPage = page + 1; // MatPaginator usa index desde 0
    
    //     return `Página ${currentPage} de ${totalPages}`;
    // };
}