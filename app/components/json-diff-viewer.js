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
        diffs.push({ path, first: a, second: b });
      }
      return diffs;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b)) {
        diffs.push({ path, first: a, second: b });
        return diffs;
      }

      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i++) {
        const p = `${path}.${i}`;
        if (i >= a.length) diffs.push({ path: p, first: 'MISSING', second: b[i] });
        else if (i >= b.length) diffs.push({ path: p, first: a[i], second: 'MISSING' });
        else diffs = diffs.concat(this.findDiffs(a[i], b[i], p));
      }
      return diffs;
    }

    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (let key of keys) {
      const p = `${path}.${key}`;
      if (!(key in a)) diffs.push({ path: p, first: 'MISSING', second: b[key] });
      else if (!(key in b)) diffs.push({ path: p, first: a[key], second: 'MISSING' });
      else diffs = diffs.concat(this.findDiffs(a[key], b[key], p));
    }

    return diffs;
  }

  isDiff(path) {
    return this.diffs.some(d => d.path === path);
  }
}
