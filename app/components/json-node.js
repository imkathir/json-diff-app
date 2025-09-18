import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class JsonNodeComponent extends Component {
  @tracked expanded = true;

  get isObject() {
    return typeof this.args.data === 'object' && this.args.data !== null;
  }

  get isArray() {
    return Array.isArray(this.args.data);
  }

  get keys() {
    if (this.isArray) {
      // return indices as strings
      return this.args.data.map((_, i) => String(i));
    } else if (this.isObject) {
      return Object.keys(this.args.data);
    }
    return [];
  }

  get diffInfo() {
    const diffs = this.args.diffs || [];
    return diffs.find((d) => d.path === this.args.prefix);
  }

  get highlightClass() {
    return this.diffInfo ? 'json-diff-highlight' : '';
  }

  @action
  toggle() {
    this.expanded = !this.expanded;
  }
}
