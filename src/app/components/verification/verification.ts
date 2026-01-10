import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppBarService } from '../../services/app-bar-service';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface VerificationImages {
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
}

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verification.html',
  styleUrl: './verification.css',
})
export class Verification implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoElement', { static: false }) videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas?: ElementRef<HTMLCanvasElement>;

  private appBar = inject(AppBarService);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  images: VerificationImages = {
    idFront: null,
    idBack: null,
    selfie: null,
  };

  imagePreviews: { [key: string]: SafeUrl | null } = {
    idFront: null,
    idBack: null,
    selfie: null,
  };

  isSubmitting = false;
  uploadProgress = 0;
  showSourceDialog = false;
  showCameraDialog = false;
  currentImageType: 'idFront' | 'idBack' | 'selfie' | null = null;
  stream: MediaStream | null = null;
  isCameraReady = false;

  readonly imageConfig = {
    idFront: {
      title: 'ID Front Side',
      icon: 'fas fa-id-card',
      color: '#2196F3',
    },
    idBack: {
      title: 'ID Back Side',
      icon: 'fas fa-id-card',
      color: '#4CAF50',
    },
    selfie: {
      title: 'Selfie Photo',
      icon: 'fas fa-user-circle',
      color: '#FF9800',
    },
  };

  ngOnInit(): void {
    this.appBar.setTitle('ID Verification');
    this.appBar.setBack(true);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.appBar.clearActions();
    this.stopCamera();
  }

  openImagePicker(type: 'idFront' | 'idBack' | 'selfie'): void {
    this.currentImageType = type;
    this.showSourceDialog = true;
  }

  closeSourceDialog(): void {
    this.showSourceDialog = false;
    // ❗ DO NOT reset currentImageType here
  }

  closeCameraDialog(): void {
    this.showCameraDialog = false;
    this.stopCamera();
    this.currentImageType = null; // ✅ safe reset
  }

  async openCamera(): Promise<void> {
    if (!this.currentImageType) {
      this.showSnackbar('No image type selected', 'error');
      return;
    }

    this.closeSourceDialog();
    this.showCameraDialog = true;
    this.isCameraReady = false;

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: this.currentImageType === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        const video = this.videoElement.nativeElement;
        video.srcObject = this.stream;

        video.onloadedmetadata = () => {
          video.play().then(() => {
            this.isCameraReady = true;
          });
        };
      }
    } catch (error: any) {
      this.showSnackbar('Camera access failed', 'error');
      this.closeCameraDialog();
    }
  }

  capturePhoto(): void {
    if (!this.videoElement || !this.canvas || !this.currentImageType) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) {
        const ts = Date.now();
        const file = new File([blob], `${this.currentImageType}_${ts}.jpg`, {
          type: 'image/jpeg',
          lastModified: ts,
        });
        this.handleImageSelected(file, this.currentImageType!);
        this.closeCameraDialog();
      }
    }, 'image/jpeg', 0.85);
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraReady = false;
  }

  openGallery(): void {
    if (!this.currentImageType) {
      this.showSnackbar('No image type selected', 'error');
      return;
    }

    this.closeSourceDialog();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        this.handleImageSelected(file, this.currentImageType!);
      }
    };

    input.click();
  }

  handleImageSelected(file: File, type: 'idFront' | 'idBack' | 'selfie'): void {
    if (file.size > 5 * 1024 * 1024) {
      this.showSnackbar('Image size must be less than 5MB', 'warning');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.showSnackbar('Invalid image file', 'warning');
      return;
    }

    this.images[type] = file;

    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        this.imagePreviews[type] =
          this.sanitizer.bypassSecurityTrustUrl(e.target.result as string);
        this.showSnackbar(`${this.imageConfig[type].title} captured successfully!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  }

  async submitVerification(): Promise<void> {
    if (!this.images.idFront || !this.images.idBack || !this.images.selfie) {
      this.showSnackbar('Please capture all required images', 'warning');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.showSnackbar('Access token missing', 'error');
      return;
    }

    this.isSubmitting = true;
    this.uploadProgress = 0;

    try {
      const formData = new FormData();
      formData.append('id_front', this.images.idFront);
      formData.append('id_back', this.images.idBack);
      formData.append('selfie', this.images.selfie);

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await this.http.post(`${environment.apiUrl}/verification/submit/`, formData, { headers }).toPromise();

      this.uploadProgress = 100;
      this.showSnackbar('Verification submitted successfully!', 'success');
      setTimeout(() => window.history.back(), 1500);
    } catch {
      this.showSnackbar('Submission failed', 'error');
    } finally {
      this.isSubmitting = false;
      this.uploadProgress = 0;
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'warning'): void {
    const snackbar = document.createElement('div');
    snackbar.className = `snackbar snackbar-${type}`;
    snackbar.textContent = message;
    document.body.appendChild(snackbar);

    setTimeout(() => snackbar.classList.add('show'), 100);
    setTimeout(() => {
      snackbar.classList.remove('show');
      setTimeout(() => snackbar.remove(), 300);
    }, 3000);
  }

  getImageTypeLabel(type: string): string {
    return this.imageConfig[type as keyof typeof this.imageConfig]?.title || 'Image';
  }
}
