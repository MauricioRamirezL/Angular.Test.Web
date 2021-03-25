import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse, } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
interface UploadResult { }
@Component({
  selector: 'app-file-uploads',
  templateUrl: './file-uploads.component.html'
})
export class FileUploadsComponent implements OnInit {
  public fileUploads: FileUploads[];
  selectedFile: File;
  errorMsg = '';
  uploadProgress = 0;
  uploading = false;
  uploadResult: UploadResult;
  constructor(private http: HttpClient) {
    this.LoadData();
  }
  ngOnInit() { }
  downloadFile(id: number) {
    const url = 'http://localhost/FN.Testing.WebApi/api/Uploads/download/' + id.toString();
    window.open(url, '_blank');
  }
  deleteFile(id: number) {
    if (confirm("Delete file?")) {
      const req = new HttpRequest(
        'DELETE',
        'http://localhost/FN.Testing.WebApi/api/Uploads/' + id.toString(),
        null,
        {
          reportProgress: true,
        }
      );
      this.http
        .request(req)
        .pipe(
          finalize(() => {
            this.uploading = false;
            this.LoadData();
          })
        )
        .subscribe(
          (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(
                (100 * event.loaded) / event.total
              );
            }
          },
          (error) => {
            throw error;
          }
        );
    }    
  }
  LoadData() {
    this.http.get<FileUploads[]>('http://localhost/FN.Testing.WebApi/api/Uploads').subscribe(result => {
      this.fileUploads = result;
    }, error => console.error(error));
  }
  chooseFile(files: FileList) {
    this.selectedFile = null;
    this.errorMsg = '';
    this.uploadProgress = 0;
    if (files.length === 0) {
      return;
    }
    this.selectedFile = files[0];
  }
  humanFileSize(bytes: number): string {
    if (Math.abs(bytes) < 1024) {
      return bytes + ' B';
    }
    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    do {
      bytes /= 1024;
      u++;
    } while (Math.abs(bytes) >= 1024 && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  }
  upload() {
    if (!this.selectedFile) {
      this.errorMsg = 'Please choose a file.';
      return;
    }

    const formData = new FormData();
    formData.append('File', this.selectedFile);

    const req = new HttpRequest(
      'POST',
      'http://localhost/FN.Testing.WebApi/api/Uploads/',
      formData,
      {
        reportProgress: true,
      }
    );
    this.uploading = true;
    this.http
      .request<UploadResult>(req)
      .pipe(
        finalize(() => {
          this.uploading = false;
          this.selectedFile = null;
          this.LoadData();
        })
      )
      .subscribe(
        (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total
            );
          } else if (event instanceof HttpResponse) {
            this.uploadResult = event.body;
          }
        },
        (error) => {
          throw error; 
        }
      );
  }
}

interface FileUploads {
  id: number;
  fileName: string;
  uploadDate: string;
  extension: string;
}
