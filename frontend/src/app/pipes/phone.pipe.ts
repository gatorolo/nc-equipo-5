import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  transform(value: string | number | undefined | null): string {
    if (!value) return '';

    let cleaned = value.toString().replace(/\D/g, '');

    if (cleaned.length === 13 && cleaned.startsWith('549')) {
      const country = cleaned.slice(0, 2);
      const prefix = cleaned.slice(2, 3);
      const area = cleaned.slice(3, 5);
      const part1 = cleaned.slice(5, 9);
      const part2 = cleaned.slice(9, 13);
      return `+${country} ${prefix} ${area} ${part1}-${part2}`;
    }

    if (cleaned.length === 10) {
      const area = cleaned.slice(0, 3);
      const mid = cleaned.slice(3, 6);
      const last = cleaned.slice(6, 10);
      return `+54 9 ${area} ${mid}-${last}`;
    }

    const match = cleaned.match(/^(\d{1,3})(\d{1,4})?(\d{1,4})?$/);
    if (match) {
      let final = '+' + match[1];
      if (match[2]) final += ' ' + match[2];
      if (match[3]) final += '-' + match[3];
      return final;
    }

    return '+' + cleaned;
  }
}
