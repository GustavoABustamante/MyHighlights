import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import IClip from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null
  @Output() update = new EventEmitter()

  showAlert = false
  inSubmission = false
  alertColor = 'neutral'
  alertMsg = 'Espera un momento... ¡Estamos actualizando tu clip!'
  loading = false

  clipID = new FormControl('', {})
  title = new FormControl('',{
    validators:[
    Validators.required,
    Validators.minLength(3)
    ],
  })
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  constructor(private modal: ModalService, private clipService: ClipService) { }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

  ngOnChanges() {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = false
    this.showAlert = false

    this.clipID.setValue(this.activeClip.docID)
    this.title.setValue(this.activeClip.title)
  }

  submit() {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = true
    this.showAlert = true
    this.loading = true
    this.alertColor = 'neutral'
    this.alertMsg = 'Espera un momento... ¡Estamos actualizando tu clip!'

    try {
      this.clipService.updateClip(
        this.clipID.value, this.title.value
      )
    } catch (e) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Ha ocurrido un problema... ¡Intenta cambiar tu clip más tarde por favor!'
      return
    }

    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Tu clip está listo!'

    this.activeClip.title = this.title.value
    this.update.emit(this.activeClip)
  }
}
