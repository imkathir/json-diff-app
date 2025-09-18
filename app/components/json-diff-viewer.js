import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class JsonDiffViewerComponent extends Component {
  @tracked json1 = '';
  @tracked json2 = '';
  @tracked parsed1 = null;
  @tracked parsed2 = null;
  @tracked diffs = [];
  @tracked error = null;
  @tracked filterType = 'all'; // 'all', 'mismatch', 'missing'

  @action
  updateJson1(event) {
    this.json1 = event.target.value;
    this.compareJsons(); // live diff as you type
  }

  @action
  updateJson2(event) {
    this.json2 = event.target.value;
    this.compareJsons(); // live diff as you type
  }

  compareJsons() {
    this.error = null;
    this.diffs = [];

    try {
      this.parsed1 = JSON.parse(this.json1 || '{}');
    } catch {
      this.error = 'First JSON invalid';
      return;
    }

    try {
      this.parsed2 = JSON.parse(this.json2 || '{}');
    } catch {
      this.error = 'Second JSON invalid';
      return;
    }

    this.diffs = this.findDiffs(this.parsed1, this.parsed2, 'root');
  }

  findDiffs(a, b, path) {
    let diffs = [];

    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        diffs.push({ path, first: a, second: b, type: 'mismatch' });
      }
      return diffs;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b)) {
        diffs.push({ path, first: a, second: b, type: 'mismatch' });
        return diffs;
      }

      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i++) {
        const p = `${path}.${i}`;
        if (i >= a.length) diffs.push({ path: p, first: 'MISSING', second: b[i], type: 'missing', isMissing: true });
        else if (i >= b.length) diffs.push({ path: p, first: a[i], second: 'MISSING', type: 'missing', isMissing: true });
        else diffs = diffs.concat(this.findDiffs(a[i], b[i], p));
      }
      return diffs;
    }

    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (let key of keys) {
      const p = `${path}.${key}`;
      if (!(key in a)) diffs.push({ path: p, first: 'MISSING', second: b[key], type: 'missing', isMissing: true });
      else if (!(key in b)) diffs.push({ path: p, first: a[key], second: 'MISSING', type: 'missing', isMissing: true });
      else diffs = diffs.concat(this.findDiffs(a[key], b[key], p));
    }

    return diffs;
  }

  get filteredDiffs() {
    if (this.filterType === 'all') {
      return this.diffs;
    }
    return this.diffs.filter(diff => diff.type === this.filterType);
  }

  get mismatchCount() {
    return this.diffs.filter(diff => diff.type === 'mismatch').length;
  }

  get missingCount() {
    return this.diffs.filter(diff => diff.type === 'missing').length;
  }

  get isAllFilter() {
    return this.filterType === 'all';
  }

  get isMismatchFilter() {
    return this.filterType === 'mismatch';
  }

  get isMissingFilter() {
    return this.filterType === 'missing';
  }

  @action
  setFilterType(type) {
    this.filterType = type;
  }

  isDiff(path) {
    return this.filteredDiffs.some(d => d.path === path);
  }
}
