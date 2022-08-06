import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';
import { url } from 'inspector';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragOver = false
  file: File | null = null
  nextStep = false
  showAlert = false
  alertColor = 'neutral'
  alertMsg = 'Por favor espera... ¡Tu video esta siendo procesado! '
  loading = false
  inSubmission = false
  percentage = 0
  showPercentage = false
  task?: AngularFireUploadTask
  screenshots: string[] = []
  selectedScreenshot = ''
  screenshotTask?: AngularFireUploadTask

  user: firebase.User | null = null

  title = new FormControl('',{
    validators:[
    Validators.required,
    Validators.minLength(3)
    ],
  })
  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(
    private storage: AngularFireStorage, 
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService) {
      auth.user.subscribe(user => this.user = user)
      this.ffmpegService.init()
     }

  ngOnDestroy(): void {
    this.task?.cancel()
  }

  async storeFile($event: Event) {
    if(this.ffmpegService.isRunning) {
      return
    }

    this.isDragOver = false
    this.file = ($event as DragEvent).dataTransfer? ($event as DragEvent).dataTransfer?.files.item(0) ?? null : ($event.target as HTMLInputElement).files?.item(0) ?? null
    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file)

    this.selectedScreenshot = this.screenshots[0]

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )
    this.nextStep = true
  }

  async uploadFile() {
    this.uploadForm.disable()
    this.showAlert = true
    this.alertColor = 'neutral'
    this.alertMsg = 'Por favor espera... ¡Tu video esta siendo procesado! '
    this.inSubmission = true
    this.loading = true
    this.showPercentage = true

    const clipeFileName = uuid()
    const clipPath = `clips/${clipeFileName}.mp4`

    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot)
    const screenshotPath = `screenshots/${clipeFileName}.png`

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob)

    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)

    const screenshotRef = this.storage.ref(screenshotPath)

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ]).subscribe((progress) => {
    const [clipProgress, screenshotProgress] = progress
    if (!clipProgress || !screenshotProgress) {
      return
    }
    const total = clipProgress + screenshotProgress
      this.percentage = total as number / 200
    })

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
      ]).pipe(
      switchMap(() => forkJoin([
        clipRef.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ]))
    ).subscribe({
      next: async (urls) => {
        const [clipURL, screenshotURL] = urls 

        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipeFileName}.mp4`,
          url: clipURL,
          screenshotURL,
          screenshotFileName: `${clipeFileName}.png`,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipsService.createClip(clip)

        this.alertColor = 'green'
        this.alertMsg = '¡Listo! tu video ha sido subido.'
        this.showPercentage = false
        this.loading = false

        setTimeout(() => {
          this.router.navigate([
            'clip', clipDocRef.id
          ])
        }, 1000);
      },
      error: (error) => {
        this.uploadForm.enable()

        this.alertColor = 'red'
        this.alertMsg = 'Algo ha pasado... El video no pudo ser subido.'
        this.inSubmission = true
        this.showPercentage = false
        console.error(error)
        
      }
    })
  }
}
