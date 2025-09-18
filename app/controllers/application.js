import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @tracked firstJson = '';
  @tracked secondJson = '';

  @action
  updateFirst(value) {
    this.firstJson = value;
  }

  @action
  updateSecond(value) {
    this.secondJson = value;
  }
}
