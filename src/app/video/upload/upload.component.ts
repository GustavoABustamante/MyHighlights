import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragOver = false
  file: File | null = null
  nextStep = false
  showAlert = false
  alertColor = 'neutral'
  alertMsg = 'Por favor espera... ¡Tu video esta siendo proceso!'
  loading = false
  inSubmission = false
  percentage = 0
  showPercentage = false

  title = new FormControl('',{
    validators:[
    Validators.required,
    Validators.minLength(3)
    ],
  })
  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(private storage: AngularFireStorage) { }

  ngOnInit(): void {
  }

  storeFile($event: Event) {
    this.isDragOver = false
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null
    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )
    this.nextStep = true
  }

  uploadFile() {
    this.showAlert = true
    this.alertColor = 'neutral'
    this.alertMsg = 'Por favor espera... ¡Tu video esta siendo procesado!'
    this.inSubmission = true
    this.loading = true
    this.showPercentage = true

    const clipeFileName = uuid()
    const clipPath = `clips/${clipeFileName}.mp4`

    const task = this.storage.upload(clipPath, this.file)
    task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })

    task.snapshotChanges().pipe(
      last()
    ).subscribe({
      next: (snapshot) => {
        this.alertColor = 'green'
        this.alertMsg = '¡Listo! tu video ha sido subido.'
        this.showPercentage = false
      },
      error: (error) => {
        this.alertColor = 'red'
        this.alertMsg = 'Algo ha pasado... El video no pudo ser subido.'
        this.inSubmission = true
        this.showPercentage = false
        console.error(error)
        
      }
    })
  }
}
